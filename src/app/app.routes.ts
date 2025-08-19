import { RouterModule, Routes } from '@angular/router';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { StyleEditorComponent } from './components/style-editor/style-editor.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    {path:'chatbot',component:ChatbotComponent},
    {path:'style-editor', component:StyleEditorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}