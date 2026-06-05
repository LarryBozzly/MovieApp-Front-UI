import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';

@customElement('privacy-page')
export class PrivacyPage extends LitElement {
  static styles = css`
    ${tailwindStyles}

    :host {
      display: block;
      height: 100dvh;
      position: relative;
    }

    .scroll-container {
      position: absolute;
      top: 4rem;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
  `;

  render() {
    return html`
      <div class="scroll-container bg-base-200">
        <main class="max-w-4xl mx-auto p-4 md:p-6 pb-12">
          <section class="bg-base-100 shadow-lg rounded-xl p-6 md:p-8 space-y-6">
            <header>
              <h1 class="text-3xl font-bold mb-2">Movviator – Privacy Policy</h1>
              <p class="text-sm text-base-content/70">Last Updated: 30/05/2026</p>
            </header>
            <p class="text-base-content/90 leading-relaxed">
              This Privacy Policy explains how we collect, use, and protect your personal data when
              you use Movviator. As a user-focused, non-commercial indie project, we only collect
              what is strictly necessary to make the app function.
            </p>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">1. Who We Are</h2>
              <p class="text-base-content/90 leading-relaxed">
                The independent Developer of Movviator acts as the Data Controller for the
                information you provide. The Service operates out of Greece.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">2. What Data We Collect</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                We collect the absolute minimum data required to run the Service:
              </p>
              <ul class="list-disc pl-6 text-base-content/80 leading-relaxed space-y-2">
                <li>
                  Account Information: When you register, we collect your email address and a
                  securely hashed password.
                </li>
                <li>
                  Usage Data: To provide our core feature (movie recommendations), we track how you
                  interact with the app, such as the movies you explore, like, or save.
                </li>
                <li>
                  Technical Log Data: We temporarily collect basic connection data (like your IP
                  address and browser type) to ensure the server is functioning and to prevent
                  abuse.
                </li>
              </ul>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">3. How We Use Your Data</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                We process your personal data solely for the following purposes:
              </p>
              <ul class="list-disc pl-6 text-base-content/80 leading-relaxed space-y-2">
                <li>
                  To provide the Service (Contract): Authenticating your login and generating
                  personalized movie recommendations.
                </li>
                <li>
                  Security (Legitimate Interest): Detecting and preventing scraping, bot traffic, or
                  unauthorized access to our server.
                </li>
                <li>
                  Communication (Legitimate Interest): We may occasionally email you regarding major
                  account changes or service shutdowns (no marketing).
                </li>
              </ul>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                We do not sell, rent, or share your data with any third parties, advertisers, or
                data brokers.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">4. Where Your Data is Stored</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                Unlike commercial apps hosted on large cloud providers, Movviator is self-hosted on
                a private, physical server (a Raspberry Pi) managed directly by the Developer in
                Greece. By using the Service, you consent to your data being stored on this
                independent hardware.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">5. Security</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                We implement standard security measures, including HTTPS encryption and password
                hashing, to protect your data. However, because this is an experimental project
                hosted on independent hardware, no system is entirely impenetrable. You acknowledge
                and accept the inherent risks of using a beta platform. Do not use a password on
                Movviator that you use for sensitive accounts elsewhere.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">6. Data Retention</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                We keep your account and usage data only for as long as your account is active or
                until the beta project is concluded. If Movviator is permanently shut down, the
                database will be securely erased.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">7. Your GDPR Rights</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                Under the General Data Protection Regulation (GDPR), you have the right to:
              </p>
              <ul class="list-disc pl-6 text-base-content/80 leading-relaxed space-y-2">
                <li>Access: Request a copy of the data we hold about you.</li>
                <li>
                  Erasure (Right to be Forgotten): Request that we delete your account and all
                  associated data.
                </li>
                <li>Rectification: Correct any inaccurate data.</li>
                <li>Restriction/Objection: Limit or object to how we process your data.</li>
              </ul>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                To exercise any of these rights, or to request complete account deletion, please
                email
                <a href="mailto:contact@movviator.tech" class="link link-primary ">
                  contact@movviator.tech </a
                >. We intend to fulfill your request within 30 days.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">8. Contact Us</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                If you have any questions or concerns about this Privacy Policy, reach out at:
                <a href="mailto:contact@movviator.tech" class="link link-primary ">
                  contact@movviator.tech
                </a>
              </p>
            </section>
          </section>
        </main>
        <footer-component></footer-component>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'privacy-page': PrivacyPage;
  }
}
