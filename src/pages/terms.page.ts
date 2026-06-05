import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';

@customElement('terms-page')
export class TermsPage extends LitElement {
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
              <h1 class="text-3xl font-bold mb-2">Movviator – Terms and Conditions</h1>
              <p class="text-sm text-base-content/70">Last Updated: 30/05/2026</p>
            </header>

            <p class="text-base-content/90 leading-relaxed">
              By accessing, registering for, or otherwise using the Service, you acknowledge that
              you have read, understood, and agree to be legally bound by these Terms and Conditions
              and our Privacy Policy. If you do not agree to these Terms in their entirety, you must
              not access or use the Service. Your continued use of the Service constitutes your
              binding acceptance of these Terms.
            </p>
            <p class="text-base-content/90 leading-relaxed">
              These Terms and Conditions (“Terms”) govern your access to and use of Movviator
              <a
                href="https://movviator.tech/"
                target="_blank"
                rel="noopener noreferrer"
                class="link link-primary"
              >
                (https://movviator.tech/) </a
              >. By registering for or using Movviator, you acknowledge that it is a beta,
              non-commercial project provided on an <strong>AS IS</strong> and
              <strong>AS AVAILABLE</strong> basis.
            </p>
            <p class="text-base-content/90 leading-relaxed">
              By accessing the Service, you agree to these Terms. If you do not agree, do not use
              the Service.
            </p>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">1. Definitions</h2>
              <ul class="list-disc pl-6 text-base-content/80 leading-relaxed space-y-2">
                <li>
                  <strong>Developer, We, Us, Our:</strong> Refers to the independent creator and
                  administrator of Movviator.
                </li>
                <li>
                  <strong>Service or Movviator:</strong> Refers to the beta application that allows
                  users to discover movies and receive recommendations based on usage.
                </li>
                <li>
                  <strong>You, User:</strong> Means the individual accessing or using the Service.
                </li>
              </ul>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">2. Beta Service & Hosting Acknowledgment</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                You acknowledge that Movviator is a free, experimental beta release hosted
                independently on micro-hardware (a Raspberry Pi system). This means:
              </p>
              <ul class="list-disc pl-6 text-base-content/80 leading-relaxed space-y-2">
                <li>
                  The Service may experience unexpected downtime, slow load times, or complete data
                  resets.
                </li>
                <li>Features may change, break, or be removed without notice.</li>
                <li>We are under no obligation to provide maintenance, support, or updates.</li>
                <li>
                  The Service may be permanently shut down at any time at the Developer's sole
                  discretion.
                </li>
              </ul>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">3. Accounts and Security</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                To receive recommendations, you must create an account using a valid email address.
              </p>
              <ul class="list-disc pl-6 text-base-content/80 leading-relaxed space-y-2">
                <li>You are responsible for keeping your login credentials confidential.</li>
                <li>
                  Because this is a beta environment, we do not guarantee the permanent retention of
                  your account data. We may delete accounts or reset the database at any time to
                  facilitate development.
                </li>
              </ul>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">4. Intellectual Property</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                We retain all rights, title, and interest in the Movviator software and platform.
                Movie titles, posters, descriptions, and related metadata displayed on the Service
                remain the property of their respective copyright holders and are used here solely
                for informational and discovery purposes.
              </p>
              <ul class="list-disc pl-6 text-base-content/80 leading-relaxed space-y-2">
                <li>
                  Our Intellectual Property: The Developer retains exclusive ownership of all
                  rights, title, and interest in and to Movviator, including but not limited to the
                  application's source code, software architecture, algorithms, user interface (UI)
                  design, graphics, branding, and the name "Movviator". Nothing in these Terms
                  grants you a license to copy, modify, distribute, reverse-engineer, decompile, or
                  create derivative works of our software or design elements.
                </li>
                <li>
                  Third-Party Content & Metadata: Movviator displays movie titles, plot summaries,
                  release dates, posters, and related metadata for informational, educational, and
                  discovery purposes. All such content remains the exclusive intellectual property
                  of its respective copyright owners, studios, or third-party data providers. The
                  Developer claims no ownership over this metadata.
                </li>
                <li>
                  Feedback License: If you provide us with any suggestions, bug reports, or feedback
                  regarding the Service, you grant the Developer an unrestricted, perpetual,
                  worldwide, royalty-free license to use, implement, and incorporate that feedback
                  into the platform without any obligation or compensation to you.
                </li>
              </ul>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">5. Fair Usage</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                Because Movviator runs on limited personal hardware, you agree not to place an undue
                burden on the system. You must not:
              </p>
              <ul class="list-disc pl-6 text-base-content/80 leading-relaxed space-y-2">
                <li>
                  Use automated bots, scrapers, or scripts to access the Service or extract data.
                </li>
                <li>
                  Attempt to overload, crash, or launch a denial-of-service attack against the
                  Service.
                </li>
                <li>Attempt to gain unauthorized access to the underlying server or database.</li>
              </ul>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                We reserve the right to ban any IP address or suspend any account that disrupts the
                Service for others.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">6. Disclaimer of Warranties</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                The Service is provided entirely free of charge on an “as is” and “as available”
                basis, with all faults. To the maximum extent permitted by law, we expressly
                disclaim all warranties, whether express or implied, including warranties of
                merchantability, accuracy of recommendations, and fitness for a particular purpose.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">7. Limitation of Liability</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                To the fullest extent permitted by law, in no event shall the Developer be liable
                for any indirect, incidental, special, or consequential damages arising out of your
                use of the Service. This includes, without limitation, loss of data, unauthorized
                access to your account, or downtime of the Service.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">8. Governing Law</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                These Terms shall be governed and construed in accordance with the laws of Greece.
              </p>
            </section>

            <section class="space-y-2">
              <h2 class="text-xl font-semibold">9. Contact</h2>
              <p class=" text-base-content/80 leading-relaxed space-y-2">
                If you have any questions about these Terms, please contact:
                <a href="mailto:contact@movviator.tech" class="link link-primary"
                  >contact@movviator.tech</a
                >
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
    'terms-page': TermsPage;
  }
}
