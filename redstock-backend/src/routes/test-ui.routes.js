const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

router.get('/', (req, res) => {
    // Proteger ruta en produccion
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Acceso denegado. Solo disponible en entorno development.' });
    }

    const startTotal = Date.now();
    
    // Ejecutamos la CLI de Jest pidiendole el reporte completo en formato JSON
    // Aumentamos maxBuffer porque el JSON puede ser un poco grande
    exec('npx jest --json --runInBand --forceExit', { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        let jestData = null;
        try {
            // Recortar la salida estándar por si hay logs o advertencias antes del JSON
            const jsonStartInx = stdout.indexOf('{');
            const jsonEndInx = stdout.lastIndexOf('}');
            if (jsonStartInx !== -1 && jsonEndInx !== -1) {
                jestData = JSON.parse(stdout.substring(jsonStartInx, jsonEndInx + 1));
            }
        } catch (e) {
            console.error('Error parseando json de jest', e);
        }

        if (!jestData) {
            return res.status(500).send(`<h1>Error ejecutando tests</h1><pre>${stderr || stdout}</pre>`);
        }

        const totalElapsed = Date.now() - startTotal;
        const total = jestData.numTotalTests;
        const passed = jestData.numPassedTests;
        const allPassed = passed === total;

        let rowsHTML = '';
        let index = 1;

        // Construir dinámicamente el listado HTML test por test
        jestData.testResults.forEach((suite) => {
            const suiteName = suite.name.replace(process.cwd(), '').replace(/\\/g, '/').replace(/^\//, '');
            suite.assertionResults.forEach((test) => {
                const isPass = test.status === 'passed';
                const rowClass = isPass ? 'pass' : 'fail';
                const tagClass = isPass ? 'tag-pass' : 'tag-fail';
                const tagLabel = isPass ? '✅ PASS' : '❌ FAIL';
                const duration = test.duration || 0;
                let failureNotes = '';
                
                if (!isPass && test.failureMessages && test.failureMessages.length > 0) {
                    // Tomamos un snippet seguro del primer mensaje de error
                    const firstLineError = test.failureMessages[0].split('\n')[0].replace(/</g, '&lt;');
                    failureNotes = `<br><small style="color:#fc8181">${firstLineError.substring(0, 150)}...</small>`;
                }

                rowsHTML += `
                <tr class="${rowClass}">
                    <td>${index++}</td>
                    <td>${test.title} ${failureNotes}</td>
                    <td><span class="tag tag-method">JEST</span></td>
                    <td class="url">${suiteName}</td>
                    <td>OK</td>
                    <td style="color: ${isPass ? '#68d391' : '#fc8181'}">
                        ${isPass ? 'OK' : 'FAIL'}
                    </td>
                    <td class="elapsed">${duration}ms</td>
                    <td><span class="tag ${tagClass}">${tagLabel}</span></td>
                </tr>
                `;
            });
        });

        // ── Renderizar HTML igual a la Plantilla Proporcionada ──
        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>RedStock API – Test Suite Runner</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Segoe UI', system-ui, sans-serif;
              background: #0f1117;
              color: #e2e8f0;
              padding: 2rem;
              min-height: 100vh;
            }
            h1 { font-size: 1.7rem; margin-bottom: 0.3rem; color: #fff; }
            .subtitle { color: #718096; font-size: .9rem; margin-bottom: 2rem; }
            .summary { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
            .badge { padding: .5rem 1.2rem; border-radius: 9999px; font-weight: 600; font-size: .9rem; }
            .badge-pass { background: #1a4731; color: #68d391; border: 1px solid #276749; }
            .badge-fail { background: #4a1122; color: #fc8181; border: 1px solid #702138; }
            .badge-info { background: #1a2840; color: #63b3ed; border: 1px solid #2a4a7f; }
            table { width: 100%; border-collapse: collapse; background: #1a1e2e; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.4); }
            th { background: #242840; color: #a0aec0; text-align: left; padding: .75rem 1rem; font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #2d3748; }
            td { padding: .75rem 1rem; border-bottom: 1px solid #2d3748; font-size: .88rem; }
            tr:last-child td { border-bottom: none; }
            tr.pass td:first-child { border-left: 3px solid #48bb78; }
            tr.fail td:first-child { border-left: 3px solid #fc8181; }
            .tag { display: inline-block; padding: .15rem .5rem; border-radius: 4px; font-size: .75rem; font-weight: 600; }
            .tag-pass { background: #1a4731; color: #68d391; }
            .tag-fail { background: #4a1122; color: #fc8181; }
            .tag-method { background: #1a2840; color: #63b3ed; font-family: monospace; }
            .url { font-family: monospace; color: #b794f4; font-size: .83rem; }
            .elapsed { color: #718096; font-size: .82rem; }
            .total-row td { font-weight: 700; background: #242840; }
          </style>
        </head>
        <body>
          <h1>🧪 RedStock API – Test Suite (Visual Runner)</h1>
          <p class="subtitle">Entorno: <strong>${process.env.NODE_ENV || 'development'}</strong> · Evaluador: <code>npx jest</code></p>

          <div class="summary">
            <span class="badge ${allPassed ? 'badge-pass' : 'badge-fail'}">
              ${passed}/${total} pruebas pasadas
            </span>
            <span class="badge badge-info">⏱ ${totalElapsed}ms total de ejecución CLI</span>
            <span class="badge badge-info">📅 ${new Date().toLocaleString()}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Prueba</th>
                <th>Suite Origin</th>
                <th>Archivo</th>
                <th>Esperado</th>
                <th>Recibido</th>
                <th>Tiempo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
              <tr class="total-row">
                <td colspan="6" style="text-align:right">Total Ejecución</td>
                <td>${totalElapsed}ms</td>
                <td><span class="tag ${allPassed ? 'tag-pass' : 'tag-fail'}">${passed}/${total}</span></td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
        `;

        res.send(html);
    });
});

module.exports = router;
