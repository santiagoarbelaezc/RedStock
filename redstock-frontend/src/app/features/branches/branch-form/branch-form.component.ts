import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { BranchService } from '../../../core/services/branch.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './branch-form.component.html',
  styleUrl: './branch-form.component.css'
})
export class BranchFormComponent implements OnInit {
  branchForm: FormGroup;
  isEdit = false;
  branchId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.branchId = +id;
      this.loadBranch(this.branchId);
    }
  }

  loadBranch(id: number) {
    this.branchService.getAll().subscribe({
      next: (res: any) => {
        const branch = (res.data || []).find((b: any) => b.id === id);
        if (branch) {
          this.branchForm.patchValue(branch);
        }
      }
    });
  }

  onSubmit() {
    if (this.branchForm.invalid) return;
    this.loading = true;

    const req$ = this.isEdit 
      ? this.branchService.update(this.branchId!, this.branchForm.value)
      : this.branchService.create(this.branchForm.value);

    req$.subscribe({
      next: () => this.router.navigate(['/branches']),
      error: () => this.loading = false
    });
  }
}
