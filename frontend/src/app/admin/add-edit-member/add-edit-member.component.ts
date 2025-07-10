import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MemberAddEdit } from '../../interface/member';
import { SharedService } from '../../util/shared.service';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-add-edit-member',
  standalone: false,
  templateUrl: './add-edit-member.component.html',
  styleUrl: './add-edit-member.component.css',
})
export class AddEditMemberComponent {
  memberForm: FormGroup = new FormGroup({});
  formInitialized = false;
  addNew = true;
  submitted = false;
  errorMessages: string[] = [];
  applicationRoles: string[] = [];
  existingMemberRoles: string[] = [];

  constructor(
    private adminService: AdminService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.addNew = false;
      this.getMember(id);
    } else {
      this.initializeForm(undefined);
    }

    this.getRoles();
  }

  getMember(id: string) {
    this.adminService.getMember(id).subscribe({
      next: (member) => {
        this.initializeForm(member);
      },
    });
  }

  getRoles() {
    this.adminService.getApplicationRoles().subscribe({
      next: (roles) => (this.applicationRoles = roles),
    });
  }

  // initializeForm(member: MemberAddEdit | undefined) {
  //   if (member) {
  //     this.memberForm = this.formBuilder.group({
  //       id: [member.id],
  //       firstName: [member.firstName, [Validators.required]],
  //       lastName: [member.lastName, [Validators.required]],
  //       userName: [member.userName, [Validators.required]],
  //       password: [''],
  //       roles: [member.roles, [Validators.required]],
  //     });

  //     this.existingMemberRoles = member.roles.split(',');
  //   } else {
  //     this.memberForm = this.formBuilder.group({
  //       id: [''],
  //       firstName: ['', [Validators.required]],
  //       lastName: ['', [Validators.required]],
  //       userName: ['', [Validators.required]],
  //       password: [
  //         '',
  //         [
  //           Validators.required,
  //           Validators.minLength(6),
  //           Validators.maxLength(15),
  //         ],
  //       ],
  //       roles: ['', Validators.required],
  //     });
  //   }

  //   this.formInitialized = true;
  // }
  initializeForm(member: MemberAddEdit | undefined) {
    this.memberForm = this.formBuilder.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      password: [''], // Leave blank for update
      roles: ['', Validators.required],
    });

    if (member) {
      // patch only after form is initialized
      this.memberForm.patchValue({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        userName: member.userName,
        roles: member.roles,
      });

      this.existingMemberRoles = member.roles.split(',');
    } else {
      // For new user, password is required
      this.memberForm.controls['password'].setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(15),
      ]);
    }

    this.formInitialized = true;
  }

  passwordOnChange() {
    if (this.addNew == false) {
      if (this.memberForm.get('password')?.value) {
        this.memberForm.controls['password'].setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
        ]);
      } else {
        this.memberForm.get('password')?.clearValidators();
      }

      this.memberForm.controls['password'].updateValueAndValidity();
    }
  }

  roleOnChange(selectedRole: string) {
    let roles = this.memberForm.get('roles')?.value.split(',');
    const index = roles.indexOf(selectedRole);
    index !== -1 ? roles.splice(index, 1) : roles.push(selectedRole);

    if (roles[0] === '') {
      roles.splice(0, 1);
    }

    this.memberForm.controls['roles'].setValue(roles.join(','));
  }

  submit() {
    this.submitted = true;
    this.errorMessages = [];
    console.log('ts hit');
    if (this.memberForm.valid) {
      this.adminService.addEditMember(this.memberForm.value).subscribe({
        next: (response: any) => {
          this.sharedService.showNotification(
            true,
            response.value.titile,
            response.value.message
          );
          this.router.navigateByUrl('/admin');
        },
        error: (error) => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        },
      });
    }
  }
}
