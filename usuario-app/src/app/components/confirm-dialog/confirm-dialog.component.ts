import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  textoCancelar: string;
  corConfirmar?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon class="dialog-icon">{{ getIcon() }}</mat-icon>
        {{ data.titulo }}
      </h2>

      <div mat-dialog-content class="dialog-content">
        <p>{{ data.mensagem }}</p>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancelar()" class="btn-cancelar">
          {{ data.textoCancelar }}
        </button>

        <button
          mat-raised-button
          [color]="data.corConfirmar || 'primary'"
          (click)="onConfirmar()"
          class="btn-confirmar"
        >
          {{ data.textoConfirmar }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        padding: 20px;
        min-width: 300px;
      }

      .dialog-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        color: #333;
      }

      .dialog-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #f44336;
      }

      .dialog-content {
        margin: 20px 0;
        line-height: 1.5;
        color: #666;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      }

      .btn-cancelar {
        color: #666;
      }

      .btn-cancelar:hover {
        background-color: #f5f5f5;
      }

      .btn-confirmar {
        min-width: 80px;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  onConfirmar(): void {
    this.dialogRef.close(true);
  }

  onCancelar(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.corConfirmar) {
      case 'warn':
        return 'warning';
      case 'accent':
        return 'help';
      default:
        return 'info';
    }
  }
}
