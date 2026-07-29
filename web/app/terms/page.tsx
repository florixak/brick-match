import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.name} — the rules governing your use of the application.`,
}

const CONTACT_EMAIL = "ondrej@ondrejptak.dev"
const LAST_UPDATED = "2026-07-29"

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose prose-sm sm:prose-base max-w-none">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        {/* 1. Acceptance and Age */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            1. Acceptance of Terms and Age Eligibility
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            By creating an account or using BrickMatch, you agree to be bound by
            these Terms of Service and our{" "}
            <Link
              href="/privacy"
              className="text-primary font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
            . If you do not agree, please do not use the service.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            You must be at least{" "}
            <strong className="text-foreground">15 years old</strong> (the age
            of digital consent in the Czech Republic) to register independently.
            Users under this age must have parental or guardian consent. We
            reserve the right to terminate accounts of users who do not meet
            this requirement.
          </p>
        </section>

        {/* 2. Service Description */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">2. Service Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            BrickMatch is a free personal project that allows registered users
            to manage their LEGO® part collection and discover which LEGO® sets
            from the Rebrickable catalog they could build from the parts they
            own. The service calculates match percentages and lists missing
            parts for each set. BrickMatch is not a commercial service and is
            provided at no charge.
          </p>
        </section>

        {/* 3. Account Registration */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            3. Account Registration and Responsibility
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            When registering, you agree to provide accurate and truthful
            information. You are responsible for:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>
              Maintaining the confidentiality of your password and account
              credentials.
            </li>
            <li>All activity that occurs under your account.</li>
            <li>
              Notifying us immediately if you suspect unauthorized access to
              your account.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We are not liable for any loss or damage arising from unauthorized
            access to your account caused by your failure to keep your
            credentials secure.
          </p>
        </section>

        {/* 4. Permissible Use */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">4. Permissible Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            You agree to use BrickMatch only for its intended personal purpose.
            The following are prohibited:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>
              Automated or scripted access to the application (bots, crawlers,
              scrapers) beyond normal browser use.
            </li>
            <li>
              Deliberately circumventing or bypassing rate limits or other
              security controls.
            </li>
            <li>
              Attempting to gain unauthorized access to the server, database, or
              other users&rsquo; data.
            </li>
            <li>
              Using the service in any way that could harm, disable, or impair
              its availability to other users.
            </li>
            <li>Violating any applicable law or regulation.</li>
          </ul>
        </section>

        {/* 5. Intellectual Property */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">5. Intellectual Property</h2>

          <h3 className="text-base font-semibold mb-2 mt-4">
            LEGO® Trademark Disclaimer
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            LEGO® is a trademark of the LEGO Group. BrickMatch is an independent
            personal project and is{" "}
            <strong className="text-foreground">
              not affiliated with, sponsored by, endorsed by, or approved by the
              LEGO Group
            </strong>{" "}
            in any way. The use of the LEGO® name and related terminology is
            solely for descriptive and identification purposes. All LEGO®
            trademarks, product names, and set images are the property of the
            LEGO Group.
          </p>

          <h3 className="text-base font-semibold mb-2 mt-4">
            Rebrickable Catalog Data
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            LEGO® set and part catalog data used by BrickMatch is sourced from{" "}
            <a
              href="https://rebrickable.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Rebrickable
            </a>
            , which is also not affiliated with the LEGO Group. This data is
            used in accordance with Rebrickable&rsquo;s terms. BrickMatch does
            not claim ownership of the catalog data.
          </p>

          <h3 className="text-base font-semibold mb-2 mt-4">
            Your Collection Data
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            The LEGO part collection data you enter into BrickMatch (your "My
            Parts" inventory) remains your own data. We process it solely to
            provide you with the matching service. You may delete your data at
            any time by deleting your account.
          </p>

          <h3 className="text-base font-semibold mb-2 mt-4">
            Application Code
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            The BrickMatch application code is the intellectual property of the
            operator. Nothing in these Terms grants you a license to copy,
            modify, distribute, or create derivative works from the application
            code.
          </p>
        </section>

        {/* 6. Data Accuracy */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            6. Data Accuracy and No Guarantee of Results
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The LEGO® catalog data used by BrickMatch is sourced from a
            third-party database (Rebrickable) and may be incomplete, outdated,
            or contain errors. Set inventories change over time and the local
            copy may not reflect the most recent catalog updates.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Matching results (percentages and missing parts lists) are{" "}
            <strong className="text-foreground">indicative only</strong>. We do
            not guarantee the accuracy or completeness of any matching result.
            You should verify results independently before making purchasing
            decisions.
          </p>
        </section>

        {/* 7. Service Availability */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">7. Service Availability</h2>
          <p className="text-muted-foreground leading-relaxed">
            BrickMatch is a personal project provided free of charge with no
            service level agreement (SLA). We make no guarantees regarding
            uptime, availability, or continuity of the service. The service may
            be interrupted, modified, or discontinued at any time without prior
            notice. We are not liable for any loss resulting from service
            unavailability.
          </p>
        </section>

        {/* 8. Termination */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">8. Termination</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">By you:</strong> You may delete
            your account at any time using the account deletion feature in the
            application. Upon deletion, all your personal data is permanently
            removed from our systems.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">By us:</strong> We reserve the
            right to suspend or terminate your account without prior notice if
            we determine, at our sole discretion, that you have violated these
            Terms of Service, misused the service, or engaged in any activity
            that could harm the service or other users.
          </p>
        </section>

        {/* 9. Disclaimer of Warranties */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            9. Disclaimer of Warranties and Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            BrickMatch is provided{" "}
            <strong className="text-foreground">&ldquo;as is&rdquo;</strong> and{" "}
            <strong className="text-foreground">
              &ldquo;as available&rdquo;
            </strong>{" "}
            without warranties of any kind, either express or implied, including
            but not limited to warranties of merchantability, fitness for a
            particular purpose, or non-infringement.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            To the fullest extent permitted by applicable law, the operator of
            BrickMatch shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising out of or in
            connection with your use of the service, even if advised of the
            possibility of such damages.
          </p>
        </section>

        {/* 10. Governing Law */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            10. Governing Law and Jurisdiction
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms of Service are governed by and construed in accordance
            with the laws of the{" "}
            <strong className="text-foreground">Czech Republic</strong>,
            including applicable European Union regulations. Any disputes
            arising from these terms or your use of the service shall be subject
            to the exclusive jurisdiction of the courts of the Czech Republic.
          </p>
        </section>

        {/* 11. Changes to Terms */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">11. Changes to These Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to update these Terms of Service at any time.
            When we do, we will update the &ldquo;Last updated&rdquo; date at
            the top of this page. For material changes, we will notify you via
            the email address associated with your account at least 14 days
            before the changes take effect. Continued use of the service after
            the effective date constitutes your acceptance of the updated terms.
          </p>
        </section>

        {/* 12. Contact */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">12. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about these Terms of Service, please
            contact us at:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary font-semibold hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <div className="border-t border-border pt-6 mt-8">
          <p className="text-xs text-muted-foreground">
            These Terms of Service were last updated on {LAST_UPDATED}. See also
            our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
