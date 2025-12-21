import { auth } from '../firebase';
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
} from 'firebase/auth';

class OTPService {
    private confirmationResult: ConfirmationResult | null = null;
    private recaptchaVerifier: RecaptchaVerifier | null = null;

    /**
     * Initialize reCAPTCHA verifier
     * Call this once when the component mounts
     */
    initializeRecaptcha(containerId: string = 'recaptcha-container') {
        if (!this.recaptchaVerifier) {
            this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA verified');
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expired');
                }
            });
        }
        return this.recaptchaVerifier;
    }

    /**
     * Send OTP to phone number
     * @param phoneNumber - Format: +91XXXXXXXXXX
     */
    async sendOTP(phoneNumber: string): Promise<boolean> {
        try {
            // Ensure phone number has country code
            const formattedPhone = phoneNumber.startsWith('+')
                ? phoneNumber
                : `+91${phoneNumber}`;

            if (!this.recaptchaVerifier) {
                this.initializeRecaptcha();
            }

            this.confirmationResult = await signInWithPhoneNumber(
                auth,
                formattedPhone,
                this.recaptchaVerifier!
            );

            console.log('OTP sent successfully to', formattedPhone);
            return true;
        } catch (error: any) {
            console.error('Error sending OTP:', error);

            // Handle specific errors
            if (error.code === 'auth/invalid-phone-number') {
                alert('Invalid phone number format');
            } else if (error.code === 'auth/too-many-requests') {
                alert('Too many requests. Please try again later.');
            } else {
                alert('Failed to send OTP. Please try again.');
            }

            return false;
        }
    }

    /**
     * Verify OTP code
     * @param code - 6-digit OTP code
     */
    async verifyOTP(code: string): Promise<boolean> {
        try {
            if (!this.confirmationResult) {
                throw new Error('No OTP request found. Please request OTP first.');
            }

            const result = await this.confirmationResult.confirm(code);
            console.log('OTP verified successfully', result.user);
            return true;
        } catch (error: any) {
            console.error('Error verifying OTP:', error);

            if (error.code === 'auth/invalid-verification-code') {
                alert('Invalid OTP code. Please try again.');
            } else if (error.code === 'auth/code-expired') {
                alert('OTP expired. Please request a new one.');
            } else {
                alert('Failed to verify OTP. Please try again.');
            }

            return false;
        }
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return auth.currentUser;
    }

    /**
     * Sign out
     */
    async signOut() {
        try {
            await auth.signOut();
            this.confirmationResult = null;
            return true;
        } catch (error) {
            console.error('Error signing out:', error);
            return false;
        }
    }
}

export const otpService = new OTPService();
