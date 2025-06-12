import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { PasswordResetService } from '../../core/services/password-reset.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-reset',
  imports: [CommonModule,  ReactiveFormsModule, RouterModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.3)' }),
        animate('0.8s cubic-bezier(0.215, 0.61, 0.355, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

  currentStep = 1;
  loading = false;
  isCompleted = false;

  code = '';

  emailForm: FormGroup;
  codeForm: FormGroup;
  passwordForm: FormGroup;

  maskedEmail = '';
  userEmail = '';
  resendTimer = 0;
  codeError = '';

  showPassword = false;
  showConfirmPassword = false;

  passwordStrength = 0;
  passwordStrengthClass = '';
  passwordStrengthText = '';
  hasMinLength = false;
  hasUpperCase = false;
  hasLowerCase = false;
  hasNumber = false;
  hasSpecial = false;

  private resendTimerSubscription?: Subscription;

  codeControls: string[] = ['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private passwordResetService: PasswordResetService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.codeForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.updatePasswordStrength(value);
    });
  }

  ngOnDestroy(): void {
    this.resendTimerSubscription?.unsubscribe();
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  updatePasswordStrength(password: string) {
    this.hasMinLength = password.length >= 8;
    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasLowerCase = /[a-z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    this.passwordStrength = [this.hasMinLength, this.hasUpperCase, this.hasLowerCase, this.hasNumber, this.hasSpecial]
      .filter(Boolean).length * 20;

    if (this.passwordStrength <= 40) {
      this.passwordStrengthClass = 'weak';
      this.passwordStrengthText = 'Weak';
    } else if (this.passwordStrength <= 60) {
      this.passwordStrengthClass = 'medium';
      this.passwordStrengthText = 'Moderate';
    } else {
      this.passwordStrengthClass = 'strong';
      this.passwordStrengthText = 'Strong';
    }
  }

  sendVerificationCode() {
    if (this.emailForm.valid) {
      this.loading = true;
      this.userEmail = this.emailForm.value.email;
      this.maskedEmail = this.maskEmail(this.userEmail);
      this.passwordResetService.sendResetCode(this.userEmail).subscribe({
        next: () => {
          this.currentStep = 2;
          this.startResendTimer();
          this.codeError = '';
          this.loading = false;
        },
        error: (err) => {
          this.codeError = err.error.error || 'Failed to send verification code.';
          console.log(this.codeError);
          this.loading = false;
        }
      });
    }
  }

  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}****@${domain}`;
  }

  startResendTimer() {
    this.resendTimer = 60;
    this.resendTimerSubscription?.unsubscribe();
    this.resendTimerSubscription = interval(1000)
      .pipe(take(61))
      .subscribe({
        next: () => {
          if (this.resendTimer > 0) {
            this.resendTimer--;
          } else {
            this.resendTimerSubscription?.unsubscribe();
          }
        }
      });
  }

  resendCode() {
    if (this.resendTimer === 0) {
      this.sendVerificationCode();
    }
  }

  goBack() {
    this.currentStep = 1;
    this.codeForm.reset();
    this.codeError = '';
  }

  onCodeInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && index < this.codeControls.length - 1) {
      this.codeInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onCodeKeydown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.codeInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  onCodePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    if (pastedData.length === 6 && /^\d{6}$/.test(pastedData)) {
      this.codeControls.forEach((control, index) => {
        this.codeForm.get(control)?.setValue(pastedData[index]);
      });
      this.codeInputs.toArray()[5].nativeElement.focus();
    }
  }

  verifyCode() {
    if (this.codeForm.valid) {
      this.loading = true;
      this.code = Object.values(this.codeForm.value).join('');
      this.passwordResetService.verifyCode(this.userEmail, this.code).subscribe({
        next: () => {
          this.currentStep = 3;
          this.codeError = '';
          this.loading = false;
        },
        error: (err) => {
          this.codeError = err.error || 'Invalid or expired code.';
          this.loading = false;
        }
      });
    }
  }

  resetPassword() {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.passwordResetService.resetPassword(this.userEmail, this.code, this.passwordForm.value.newPassword).subscribe({
        next: () => {
          this.isCompleted = true;
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 10000);
        },
        error: (err) => {
          this.codeError = err.error || 'Failed to reset password.';
          this.loading = false;
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getEmailErrorMessage(): string {
    const emailControl = this.emailForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required.';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    return '';
  }
}