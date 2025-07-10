import { Component, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '../util/shared.service';
import { AdminService } from './admin.service';
import { MemberView } from '../interface/member';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  members: MemberView[] = [];
  memberToDelete: MemberView | undefined;
  modalRef?: BsModalRef;

  constructor(
    private adminService: AdminService,
    private sharedService: SharedService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.adminService.getMembers().subscribe({
      next: (members) => (this.members = members),
    });
  }

  lockMember(id: string) {
    this.adminService.lockMember(id).subscribe({
      next: (_) => {
        this.handleLockUnlockFilterAndMessage(id, true);
      },
    });
  }

  unlockMember(id: string) {
    this.adminService.unlockMember(id).subscribe({
      next: (_) => {
        this.handleLockUnlockFilterAndMessage(id, false);
      },
    });
  }

  deleteMember(id: string, template: TemplateRef<any>) {
    let member = this.findMember(id);
    if (member) {
      this.memberToDelete = member;
      this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
    }
  }

  confirm() {
    if (this.memberToDelete) {
      this.adminService.deleteMember(this.memberToDelete.id).subscribe({
        next: (_) => {
          this.sharedService.showNotification(
            true,
            'Deleted',
            `Member of ${this.memberToDelete?.userName} has been deleted!`
          );
          this.members = this.members.filter(
            (x) => x.id !== this.memberToDelete?.id
          );
          this.memberToDelete = undefined;
          this.modalRef?.hide();
        },
      });
    }
  }

  decline() {
    this.memberToDelete = undefined;
    this.modalRef?.hide();
  }

  private handleLockUnlockFilterAndMessage(id: string, locking: boolean) {
    let member = this.findMember(id);

    if (member) {
      member.isLocked = !member.isLocked;

      if (locking) {
        this.sharedService.showNotification(
          true,
          'Locked',
          `${member.userName} member has been locked`
        );
      } else {
        this.sharedService.showNotification(
          true,
          'Unlocked',
          `${member.userName} member has been unlocked`
        );
      }
    }
  }

  private findMember(id: string): MemberView | undefined {
    let member = this.members.find((x) => x.id === id);
    if (member) {
      return member;
    }

    return undefined;
  }
}
