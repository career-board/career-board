import { Component } from '@angular/core';
import { TimelineComponent } from "../timeline/timeline.component";
import { UserListComponent } from "../../../posts/components/user-list/user-list.component";

@Component({
  selector: 'app-admin',
  imports: [UserListComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

}
