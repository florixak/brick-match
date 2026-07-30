import type { Metadata } from "next"
import Link from "next/link"
import ContactLink from "@/components/legal/contact-link"
import LegalSection from "@/components/legal/legal-section"
import { siteConfig } from "@/lib/config"
import { CONTROLLER_NAME, LAST_UPDATED } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name} — how we collect, use, and protect your personal data.`,
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose prose-sm sm:prose-base max-w-none">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <LegalSection title="1. Data Controller">
          <p className="text-muted-foreground leading-relaxed">
            The data controller responsible for processing your personal data is{" "}
            <strong className="text-foreground">{CONTROLLER_NAME}</strong>,
            operator of BrickMatch, a personal project. If you have any
            questions about how your data is handled, please contact us at:{" "}
            <ContactLink />.
          </p>
        </LegalSection>

        <LegalSection title="2. Personal Data We Collect">
          <p className="text-muted-foreground leading-relaxed mb-3">
            When you use BrickMatch, we collect the following personal data:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>
              <strong className="text-foreground">Email address</strong> — used
              to identify your account and allow you to log in.
            </li>
            <li>
              <strong className="text-foreground">Password</strong> — stored
              exclusively as a cryptographic hash using the Argon2 algorithm.
              Your password is never stored in readable (plaintext) form and
              cannot be recovered by us.
            </li>
            <li>
              <strong className="text-foreground">LEGO collection data</strong>{" "}
              — the list of LEGO parts and quantities you add to your collection
              ("My Parts"). This data is tied to your account and constitutes
              personal data under the GDPR.
            </li>
            <li>
              <strong className="text-foreground">IP address</strong> — recorded
              as a byproduct of server logs and rate-limiting mechanisms. This
              data is used solely for security and service protection purposes.
            </li>
            <li>
              <strong className="text-foreground">
                Authentication cookie (JWT token)
              </strong>{" "}
              — a persistent httpOnly cookie named{" "}
              <code className="text-foreground font-mono text-xs">
                access_token
              </code>{" "}
              containing an authentication token is set when you log in. It
              expires after 24 hours by default, is not accessible to
              JavaScript, and is used solely to maintain your login session.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Legal Basis for Processing (GDPR)">
          <p className="text-muted-foreground leading-relaxed mb-3">
            We process your personal data on the following legal grounds under
            Article 6 of the GDPR:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>
              <strong className="text-foreground">
                Performance of contract
              </strong>{" "}
              (Art. 6(1)(b)) — your account information and collection data are
              processed because they are necessary to provide the service you
              registered for.
            </li>
            <li>
              <strong className="text-foreground">Legitimate interest</strong>{" "}
              (Art. 6(1)(f)) — server logs and IP addresses are retained briefly
              for rate-limiting, abuse prevention, and security purposes. Our
              interest in operating a secure service does not override your
              rights and freedoms.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="4. How We Use Your Data">
          <p className="text-muted-foreground leading-relaxed mb-3">
            Your data is used for the following purposes:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>
              <strong className="text-foreground">Authentication</strong> —
              verifying your identity when you log in.
            </li>
            <li>
              <strong className="text-foreground">Set matching</strong> —
              calculating which LEGO sets from the catalog you can build from
              your owned parts.
            </li>
            <li>
              <strong className="text-foreground">Security</strong> — protecting
              the service against abuse through rate limiting and server-side
              logging.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            <strong className="text-foreground">
              Your data is not used for:
            </strong>{" "}
            advertising, profiling, analytics beyond basic security needs, or
            sale/transfer to any third party for commercial purposes. We do not
            run any advertising campaigns and do not share your personal data
            with advertisers.
          </p>
        </LegalSection>

        <LegalSection title="5. Third-Party Service Providers">
          <p className="text-muted-foreground leading-relaxed mb-3">
            We use the following third-party infrastructure providers who may
            process your personal data on our behalf:
          </p>
          <ul className="space-y-3 text-muted-foreground list-disc list-inside">
            <li>
              <strong className="text-foreground">
                Neon (database hosting)
              </strong>{" "}
              — your account and collection data is stored in a PostgreSQL
              database hosted by Neon, Inc. The database is located in the{" "}
              <strong className="text-foreground">
                AWS Europe (Frankfurt) region
              </strong>{" "}
              within the EU/EEA. The physical storage location of your data is
              within the EU.
            </li>
            <li>
              <strong className="text-foreground">
                Vercel (application hosting)
              </strong>{" "}
              — the BrickMatch application is hosted on Vercel&rsquo;s
              infrastructure. The primary serverless function region is{" "}
              <strong className="text-foreground">
                US East (Washington D.C., iad1)
              </strong>
              , which is located outside the EU/EEA. Network requests, including
              your IP address, are processed by Vercel&rsquo;s servers in the
              United States. This transfer is governed by Standard Contractual
              Clauses (SCCs) concluded with Vercel, Inc., in accordance with
              GDPR Art. 46(2)(c). For more information, see{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Vercel&rsquo;s Privacy Policy
              </a>
              .
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            LEGO catalog data (set and part information) is sourced from{" "}
            <a
              href="https://rebrickable.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Rebrickable
            </a>
            . Rebrickable does not receive or process any of your personal data
            — it is solely a source of publicly available catalog data imported
            locally into our database.
          </p>
        </LegalSection>

        <LegalSection title="6. Data Retention">
          <p className="text-muted-foreground leading-relaxed">
            Your account data (email, password hash, and LEGO collection) is
            retained for as long as your account exists. When you delete your
            account through the in-app account deletion feature, your active
            account record and all associated owned-parts data are deleted
            immediately from the application database.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Provider-managed database history, snapshots, and recovery copies
            maintained by Neon may retain this data for a period determined by
            their applicable retention settings, over which we have no
            individual-record control. Server logs containing IP addresses are
            subject to Vercel&rsquo;s logging retention policies.
          </p>
        </LegalSection>

        <LegalSection title="7. Your Rights Under GDPR (Art. 15–22)">
          <p className="text-muted-foreground leading-relaxed mb-3">
            As a data subject, you have the following rights:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>
              <strong className="text-foreground">Right of access</strong> —
              request a copy of the personal data we hold about you.
            </li>
            <li>
              <strong className="text-foreground">
                Right to rectification
              </strong>{" "}
              — request correction of inaccurate data.
            </li>
            <li>
              <strong className="text-foreground">Right to erasure</strong> —
              delete your account and all associated data directly through the
              app&rsquo;s account deletion feature, or contact us to request
              deletion.
            </li>
            <li>
              <strong className="text-foreground">
                Right to data portability
              </strong>{" "}
              — request your data in a structured, machine-readable format.
            </li>
            <li>
              <strong className="text-foreground">
                Right to object / restrict processing
              </strong>{" "}
              — object to processing based on legitimate interest.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            <strong className="text-foreground">Account deletion</strong> can be
            performed directly within the app. For all other rights requests,
            please contact us at <ContactLink />. We will respond without undue
            delay and, in any event, within one month of receiving your request.
            Where permitted, this period may be extended by up to two further
            months; we will notify you within the first month if an extension is
            necessary.
          </p>
        </LegalSection>

        <LegalSection title="8. Cookies">
          <p className="text-muted-foreground leading-relaxed mb-3">
            BrickMatch uses a single cookie:
          </p>
          <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 font-semibold text-foreground">Name</th>
                  <th className="pb-2 font-semibold text-foreground">
                    Purpose
                  </th>
                  <th className="pb-2 font-semibold text-foreground">Type</th>
                  <th className="pb-2 font-semibold text-foreground">
                    Expires
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pt-2 pr-4 font-mono">access_token</td>
                  <td className="pt-2 pr-4">
                    Maintains your login session (JWT authentication token)
                  </td>
                  <td className="pt-2 pr-4">Necessary / Functional</td>
                  <td className="pt-2">Persistent (default: 24 hours)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-3">
            This cookie is classified as a strictly necessary/functional cookie
            under the ePrivacy Directive — it is required for the service to
            function and is not used for tracking or analytics. It is set as{" "}
            <code className="text-foreground font-mono text-xs">httpOnly</code>,
            meaning it cannot be accessed by JavaScript, which protects it from
            cross-site scripting attacks. No marketing, tracking, or advertising
            cookies are used.
          </p>
        </LegalSection>

        <LegalSection title="9. Security">
          <p className="text-muted-foreground leading-relaxed">
            We take reasonable technical measures to protect your personal data.
            Passwords are hashed using the Argon2 algorithm before storage —
            this means your actual password is never stored and cannot be
            recovered even in the event of a data breach. Authentication tokens
            are stored in httpOnly cookies, reducing the risk of theft via
            client-side scripts.
          </p>
        </LegalSection>

        <LegalSection title="10. Age Restriction">
          <p className="text-muted-foreground leading-relaxed">
            BrickMatch is not intended for use by children below the age of
            digital consent. In the Czech Republic, the minimum age for
            independent consent to online data processing is{" "}
            <strong className="text-foreground">15 years</strong> under Act No.
            110/2019 Coll. (§ 7 GDPR implementation). If you are under this age,
            you must obtain parental or guardian consent before registering. We
            do not knowingly collect personal data from children below the age
            of digital consent.
          </p>
        </LegalSection>

        <LegalSection title="11. Changes to This Policy">
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. When we do, we
            will update the &ldquo;Last updated&rdquo; date at the top of this
            page. For material changes that affect your rights, we will notify
            you via the email address associated with your account at least 14
            days before the changes take effect. Continued use of the service
            after the effective date constitutes your acceptance of the updated
            policy.
          </p>
        </LegalSection>

        <LegalSection title="12. Contact and Supervisory Authority">
          <p className="text-muted-foreground leading-relaxed mb-3">
            For any questions, requests, or complaints regarding this Privacy
            Policy or the processing of your personal data, please contact us
            at: <ContactLink />.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You also have the right to lodge a complaint with the supervisory
            authority in the Czech Republic:{" "}
            <a
              href="https://www.uoou.gov.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Office for Personal Data Protection (ÚOOÚ)
            </a>{" "}
            — Pplk. Sochora 27, 170 00 Praha 7, Czech Republic.
          </p>
        </LegalSection>

        <div className="border-t border-border pt-6 mt-8">
          <p className="text-xs text-muted-foreground">
            This Privacy Policy was last updated on {LAST_UPDATED}. See also our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
