import fs from "fs";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI && fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const INAUGURAL_ARTICLE = {
  title: "Infosys, TCS and Wipro Green Card Suspension: What the US PERM Action Means",
  slug: "infosys-tcs-wipro-green-card-perm-suspension",
  dek: "The US Department of Labor has halted permanent labor certification (PERM) processing for eight major technology employers, including TCS, Infosys, Wipro, Microsoft, and Adobe. Here is what is confirmed, what remains an allegation, how PERM differs from H-1B, and what affected workers must check immediately.",
  category: "Immigration & Careers",
  tags: [
    "US Immigration",
    "PERM Labor Certification",
    "Indian IT",
    "H-1B Visa",
    "Green Card",
    "TCS",
    "Infosys",
    "Wipro",
    "Cognizant",
    "Microsoft",
    "Adobe",
    "HCLTech"
  ],
  isAnalysisOrOpinion: "Analysis",
  status: "published",
  featured: true,
  readingTime: "8 min read",
  author: {
    name: "Lokesh Sain",
    role: "Software Engineer & Independent Commentator",
    bio: "Software Engineer based in Jaipur. Writing independent analyses on technology, global affairs, industry policy, and modern engineering.",
    avatar: ""
  },
  coverImage: {
    url: "/images/blog/perm-suspension-editorial.webp",
    alt: "US Department of Labor seal and corporate technology headquarters conceptual illustration",
    caption: "The US Department of Labor announced an administrative suspension of PERM application processing for eight technology employers in October 2026.",
    credit: "Perspectives Editorial Analysis / Data: US DOL FLAG"
  },
  seoTitle: "Infosys, TCS, Wipro Green Card Suspension: PERM Explained",
  seoDescription: "Understand the reported US PERM suspension involving Infosys, TCS, Wipro and other firms, what PERM means, how it differs from H-1B, and what remains unconfirmed.",
  canonicalUrl: "https://lokeshsain.vercel.app/blog/infosys-tcs-wipro-green-card-perm-suspension",
  sources: [
    {
      title: "Permanent Labor Certification (PERM) Program Regulations & Adjudications",
      organization: "US Department of Labor (FLAG / ETA)",
      url: "https://flag.dol.gov/index.php/programs/perm",
      publishDate: "October 2026",
      accessDate: "October 9, 2026"
    },
    {
      title: "TCS sees no impact from US green card programme suspension on workforce strategy",
      organization: "Reuters",
      url: "https://www.reuters.com/world/india/tcs-sees-no-impact-us-green-card-programme-suspension-workforce-strategy-2026-10-09/",
      publishDate: "October 9, 2026",
      accessDate: "October 9, 2026"
    },
    {
      title: "US suspends TCS, Infosys, Wipro, HCLTech, Cognizant from PERM green card programme",
      organization: "The Economic Times",
      url: "https://economictimes.indiatimes.com/nri/latest-updates/us-suspends-tcs-infosys-wipro-hcltech-cognizant-and-three-other-firms-from-perm-green-card-programme/articleshow/134799468.cms",
      publishDate: "October 8, 2026",
      accessDate: "October 9, 2026"
    },
    {
      title: "US PERM suspension on Indian IT firms: Green card and H-1B rules explained",
      organization: "The Indian Express",
      url: "https://indianexpress.com/article/explained/explained-global/us-perm-suspension-indian-it-firms-green-card-workers-explained-10913011/",
      publishDate: "October 8, 2026",
      accessDate: "October 9, 2026"
    },
    {
      title: "Official Media Briefing on US PERM Announcement and Indian IT Workers",
      organization: "Ministry of External Affairs, Government of India",
      url: "https://www.mea.gov.in/media-briefings.htm",
      publishDate: "October 9, 2026",
      accessDate: "October 9, 2026"
    },
    {
      title: "Employment-Based Permanent Residency Requirements (EB-2 and EB-3)",
      organization: "U.S. Citizenship and Immigration Services (USCIS)",
      url: "https://www.uscis.gov/working-in-the-united-states/permanent-workers",
      publishDate: "September 2026",
      accessDate: "October 9, 2026"
    },
    {
      title: "H-1B Specialty Occupations and AC21 § 106(a) Post-Sixth-Year Extensions",
      organization: "U.S. Citizenship and Immigration Services (USCIS)",
      url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
      publishDate: "October 2026",
      accessDate: "October 9, 2026"
    },
    {
      title: "Visa Bulletin For October 2026 (Priority Dates and Final Action Dates)",
      organization: "U.S. Department of State — Bureau of Consular Affairs",
      url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
      publishDate: "September 2026",
      accessDate: "October 9, 2026"
    }
  ],
  content: `## Opening Summary: What Happened and What It Means

On **October 8–9, 2026**, the United States Department of Labor (DOL) took an aggressive administrative action: it halted the intake of new applications and froze the adjudication of pending filings under the **Permanent Labor Certification (PERM)** program for eight major technology employers.

The named companies include leading Indian IT services organizations—**Tata Consultancy Services (TCS), Infosys, Wipro, HCL Technologies, and Cognizant**—as well as global consultancy **Capgemini** and American enterprise technology leaders **Microsoft and Adobe**.

Almost immediately, alarming headlines circulated on social networks claiming that "all US Green Cards are cancelled" or that "H-1B engineers must depart the United States."

**Neither claim is true.**

This administrative pause applies exclusively to the **Department of Labor's PERM labor certification gateway**. It does not revoke existing non-immigrant visas, does not invalidate approved immigrant petitions, and does not cancel existing permanent resident cards.

Below is an objective, fact-checked breakdown of what was officially enacted, what remains unproven, the exact mechanics of the immigration pipeline, and the immediate steps affected technology workers should take.

---

## Chronological Timeline: October 8–9, 2026

* **October 8, 2026 (Washington, D.C.):** U.S. Labor Secretary Keith Sonderling, alongside Vice President J.D. Vance (who heads the administration's Anti-Fraud Task Force), publicly announced the immediate suspension of eight technology companies from the PERM program. Secretary Sonderling stated that federal audits are investigating recruitment compliance, wage parity, and whether domestic US workers were displaced. Vice President Vance specifically criticized enterprise reliance on foreign talent programs, citing historical filing volumes across the tech sector.
* **October 8, 2026 (Evening):** Data released by federal labor authorities indicated that since 2009, these eight organizations collectively submitted requests for nearly three million foreign workers, received over 230,000 H-1B approvals, and secured more than 100,000 PERM labor certifications.
* **October 9, 2026 (Morning — Mumbai / Global):** Tata Consultancy Services (TCS) issued an official response reported by Reuters, stating that its workforce strategy in the United States remains sound and largely unaffected. TCS clarified that its active PERM filings over the preceding 24 months have been in the "single digits," reflecting a decadelong transition toward hiring American workers locally.
* **October 9, 2026 (Afternoon — New Delhi):** The Ministry of External Affairs (MEA) of India addressed the developments during a formal press briefing. Official spokespersons noted that the action relates specifically to labor market certifications and underscored that valid H-1B visas and dependent family statuses are not legally impaired by the announcement.

---

## Verified List of Affected Employers

The eight corporations named across official federal announcements and corroborated international reporting are:

| Corporation | Sector | Primary Headquarters | Reported Action |
| :--- | :--- | :--- | :--- |
| **Tata Consultancy Services (TCS)** | IT Services & Global Consulting | Mumbai, India | New PERM filings blocked; pending paused |
| **Infosys** | IT Services & Digital Transformation | Bengaluru, India | New PERM filings blocked; pending paused |
| **Wipro** | IT Services & Technology Engineering | Bengaluru, India | New PERM filings blocked; pending paused |
| **HCL Technologies (HCLTech)** | Engineering & Digital Services | Noida, India | New PERM filings blocked; pending paused |
| **Cognizant** | Enterprise IT & Business Consulting | Teaneck, New Jersey, USA | New PERM filings blocked; pending paused |
| **Capgemini** | Technology Consulting & Outsourcing | Paris, France | New PERM filings blocked; pending paused |
| **Microsoft** | Cloud Infrastructure & Enterprise Software | Redmond, Washington, USA | New PERM filings blocked; pending paused |
| **Adobe** | Creative Cloud & Digital Experience | San Jose, California, USA | New PERM filings blocked; pending paused |

---

## What is PERM? The Three-Phase Green Card Architecture

To understand the actual impact, one must distinguish between the three distinct, sequential steps required for employment-based permanent residency (specifically in EB-2 and EB-3 preference categories):

\`\`\`text
Step 1: PERM Labor Certification (DOL)
   └─► Testing the US labor market via Form ETA-9089.
        [THIS STEP IS SUSPENDED FOR THE 8 EMPLOYERS]

Step 2: Immigrant Petition for Alien Worker (USCIS)
   └─► Employer files Form I-140 to verify qualifications and establish Priority Date.
        [NOT ADMINISTERED BY DOL; REMAINS ACTIVE UNDER USCIS]

Step 3: Adjustment of Status (USCIS)
   └─► Employee files Form I-485 when Priority Date becomes current under Visa Bulletin.
        [REMAINS FULLY ACTIVE UNDER USCIS ADJUDICATION]
\`\`\`

### Phase 1: PERM Labor Certification (DOL)
Administered by the Department of Labor's Employment and Training Administration (ETA). Before an employer can sponsor an employee for a permanent immigrant visa, the employer must test the domestic labor market through mandatory recruitment advertisements, state workforce agency job orders, and internal physical postings. The employer must certify via **Form ETA-9089** that there are no able, willing, qualified, and available US workers for the position at the prevailing wage.

### Phase 2: Form I-140 Immigrant Petition (USCIS)
Once the DOL certifies Form ETA-9089, the case moves out of the Department of Labor entirely and into the jurisdiction of the Department of Homeland Security via **U.S. Citizenship and Immigration Services (USCIS)**. The employer submits Form I-140 to demonstrate that the company possesses the ability to pay the wage and that the foreign worker meets the educational and experience requirements. The formal filing date of the original PERM becomes the applicant's **Priority Date**.

### Phase 3: Form I-485 Adjustment of Status (USCIS)
Due to statutory per-country numerical limits established by the Immigration Act of 1990, Indian nationals face decades-long backlogs. When an applicant's Priority Date finally becomes "current" according to the State Department's monthly **Visa Bulletin**, the worker files Form I-485 to adjust status from non-immigrant to Lawful Permanent Resident (Green Card holder).

**The October 2026 suspension applies solely to Phase 1 (PERM)**. It does not alter statutory rights or USCIS regulations governing Phase 2 or Phase 3.

---

## What This Means by Case Status: Individual Scenarios

The real-world consequence for any individual worker depends entirely on where their immigration petition sits in the administrative pipeline:

### 1. Pre-Filing / Recruitment Phase
* **Status:** If your employer had initiated labor market testing (recruitment advertisements, job postings) but had not yet received certification from the DOL, the process is frozen.
* **Impact:** Your employer cannot submit Form ETA-9089 on your behalf until the DOL lifts or modifies the suspension. Recruitment advertisements generally have a 180-day validity window under 20 CFR § 656.17; if the suspension outlasts this validity window, recruitment will likely have to be re-run when processing resumes.

### 2. Pending Form ETA-9089 at the Department of Labor
* **Status:** Your PERM application was submitted before October 8, 2026, and was awaiting DOL adjudication.
* **Impact:** Active adjudication is paused. The DOL will neither approve nor issue audit determinations on pending filings for the designated eight employers while the review continues.

### 3. Approved PERM / Pending or Approved Form I-140
* **Status:** The DOL already certified your ETA-9089 prior to the suspension, and you either have an approved Form I-140 or a pending Form I-140 at USCIS.
* **Impact:** **Your status is protected.** Under established immigration jurisprudence and the American Competitiveness in the Twenty-First Century Act (AC21), an approved I-140 remains valid unless revoked for substantive fraud. Your established **Priority Date is preserved**, and you remain eligible to port your priority date to future employers under AC21 § 104(c).

### 4. Workers Nearing the 6-Year H-1B Ceiling
* **Status:** Engineers approaching year 5 or 6 of their maximum allowable H-1B stay who do not yet hold an approved Form I-140.
* **Impact:** **This is the group facing the highest procedural friction.** Under AC21 § 106(a), an H-1B holder can extend their stay beyond the six-year statutory limit in one-year increments only if their PERM or I-140 was filed at least **365 days prior** to reaching the end of their sixth year.
* If a worker is in Year 5 and their PERM cannot be filed, they risk reaching the six-year limit without qualifying for a 365-day extension.
* **Potential Remedies:**
  * **Recapture Unused Time:** Calculate all days spent outside the United States during the six-year period using passport stamps and I-94 travel history. That time can be recaptured to extend the H-1B end date.
  * **Employer Transfer (H-1B Portability):** Transferring to an employer not subject to the DOL pause to initiate PERM recruitment.
  * **Intra-Company Relocation:** Moving temporarily to an offshore development center (such as India, Canada, or the UK) and re-entering the US after one year on an L-1 visa or renewing H-1B after one year abroad.

### 5. Pending Form I-485 (Adjustment of Status)
* **Status:** Workers who filed Form I-485 after their priority date became current.
* **Impact:** The adjudication of Form I-485 is handled exclusively by USCIS, not the DOL. These applications proceed under standard USCIS adjudication criteria.

---

## What is Confirmed vs. What Remains an Allegation

In fast-moving policy developments, distinguishing established official facts from investigatory allegations is vital:

### Confirmed Official Facts
1. **Administrative Action Taken:** The U.S. Department of Labor has officially stopped accepting new PERM applications and paused pending ETA-9089 reviews for the eight named corporations.
2. **H-1B Visas Remain Valid:** Existing H-1B visas, lawful non-immigrant status, and extensions for employers with approved I-140s are not cancelled by this action.
3. **No Blanket Debarment:** The employers have not received formal debarment orders under 20 CFR § 656.31 (which requires formal administrative hearings before an Administrative Law Judge).
4. **Corporate Responses:** Major affected employers (such as TCS) have confirmed that their active PERM volume is minimal relative to their overall US workforce, limiting enterprise operational risk.

### Unproven Allegations & Active Inquiries
1. **Claims of Systematic Fraud:** Accusations by political figures that these firms engaged in deliberate visa fraud or illegal displacement of domestic workers represent administrative allegations and political rhetoric, not finalized court judgments.
2. **Permanence:** It is not confirmed that this suspension will become permanent. Most administrative program holds either resolve through compliance audits, negotiated settlements, or federal court challenges.

### Material Uncertainties as of October 9, 2026
1. **Duration:** The Department of Labor has announced no sunset date or projected timeline for concluding its review.
2. **Litigation:** Affected companies or business coalitions (such as the US Chamber of Commerce or IT industry trade groups) have not yet announced whether they will seek emergency injunctive relief under the Administrative Procedure Act (APA).

---

## Practical Checklist for Affected Employees

If you are employed by one of the eight named companies, here is what you should verify immediately:

* [ ] **Locate Your DOL Case Number:** If a PERM was submitted, obtain your Form ETA-9089 tracking number (e.g., A-XXXXX-XXXXX) from your immigration portal to confirm whether it was certified prior to October 8, 2026.
* [ ] **Confirm Form I-140 Status:** If your I-140 was approved, download and securely store Form I-797 (Notice of Action) displaying your Priority Date and receipt number.
* [ ] **Audit Your 6-Year H-1B Expiration Date:** Calculate the exact date you will reach 6 years of cumulative physical presence in the US.
* [ ] **Tally All Recapture Days:** Compile boarding passes, entry/exit stamps, and I-94 travel records for every vacation, business trip, or personal visit outside the US. Every day outside the US can be reclaimed.
* [ ] **Avoid Panic Resignations:** Transferring employers hastily without confirming the new company's immigration standing or financial stability can create compounding complications.
* [ ] **Consult Independent Immigration Counsel:** If your 6-year H-1B deadline is within the next 12 to 18 months, request an independent consultation with a licensed US immigration attorney.

---

## Frequently Asked Questions

### Does this suspension cancel my H-1B visa?
**No.** An H-1B is a temporary non-immigrant work authorization governed by USCIS, not the Department of Labor PERM division. Valid H-1B status, work eligibility, and lawful residence remain intact.

### Can an affected employer file for an H-1B transfer or extension?
**Yes.** Standard H-1B extensions (including 3-year extensions based on an approved I-140) and transfers are filed with USCIS using Form I-129 and an approved Labor Condition Application (LCA Form ETA-9035), which is separate from the PERM ETA-9089 process.

### Can an employee transfer to another company and restart PERM?
**Yes.** The Department of Labor action applies specifically to the eight designated employer entities. Other companies not named in the order continue to file and process PERM applications normally.

### Are family-based green cards or EB-1 visas affected?
**No.** Family-sponsored immigration, diversity lottery visas, EB-1 petitions (Extraordinary Ability, Outstanding Researchers, Multinational Managers), and EB-2 National Interest Waivers (NIW) do not require a PERM labor certification and are completely unaffected.

---

## Independent Perspective: What This Signals About Global Tech Talent

*(Editorial Analysis / Opinion by Lokesh Sain)*

As a software engineer observing both enterprise system design and global macroeconomic shifts, this announcement marks a pivotal structural milestone in international technology hiring.

For three decades, the global technology services model operated on a well-understood formula: Indian engineering graduates spent several years developing deep technical proficiency onshore in India, traveled to client sites in the US on H-1B visas, and eventually transitioned into corporate-sponsored green card queues.

However, that paradigm was already fracturing under the weight of statutory per-country caps that created multi-decade waits for Indian applicants. This October 2026 DOL decision will likely accelerate three ongoing transformations:

1. **The Rise of Global Capability Centers (GCCs):** Blocking labor certification pipelines will not stop American enterprises from needing complex software architectures, cloud engineering, or AI infrastructure. It will simply incentivize corporations to expand high-value engineering operations in Bengaluru, Hyderabad, Pune, and Eastern European hubs where talent can innovate without visa vulnerability.
2. **Direct Local Hiring by IT Giants:** As TCS's official statement revealed, the major IT services firms had already adapted over the past decade by hiring American university graduates and establishing domestic delivery centers across Texas, Ohio, Indiana, and North Carolina.
3. **The Urgent Need for Statutory Reform:** Pausing PERM filings generates immediate domestic political visibility, but it avoids the foundational problem: the United States immigration architecture remains governed by statutory ceilings enacted in 1990—long before cloud computing, distributed remote engineering, and the AI era existed.

Until statutory laws are updated to reflect modern economic realities, administrative pauses will create uncertainty for individual engineers while accelerating the decentralized distribution of software engineering worldwide.

---

## Sources & Documentation

* **Primary Government Source:** [U.S. Department of Labor (FLAG) — Permanent Labor Certification (PERM) Program](https://flag.dol.gov/index.php/programs/perm) (Accessed October 9, 2026).
* **Primary Government Source:** [U.S. Citizenship and Immigration Services — Employment-Based Permanent Workers](https://www.uscis.gov/working-in-the-united-states/permanent-workers) (Accessed October 9, 2026).
* **Primary Government Source:** [U.S. Department of State — Visa Bulletin For October 2026](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html) (Accessed October 9, 2026).
* **Corporate Statement & Reporting:** [Reuters — TCS sees no impact from US green card programme suspension on workforce strategy](https://www.reuters.com/world/india/tcs-sees-no-impact-us-green-card-programme-suspension-workforce-strategy-2026-10-09/) (Published October 9, 2026).
* **Independent Coverage:** [The Economic Times — US suspends TCS, Infosys, Wipro, HCLTech, Cognizant from PERM green card programme](https://economictimes.indiatimes.com/nri/latest-updates/us-suspends-tcs-infosys-wipro-hcltech-cognizant-and-three-other-firms-from-perm-green-card-programme/articleshow/134799468.cms) (Published October 8, 2026).
* **Legal & Analytical Coverage:** [The Indian Express — US PERM suspension on Indian IT firms: Green card and H-1B rules explained](https://indianexpress.com/article/explained/explained-global/us-perm-suspension-indian-it-firms-green-card-workers-explained-10913011/) (Published October 8, 2026).
* **Government Briefing:** [Ministry of External Affairs (MEA), Government of India](https://www.mea.gov.in/) (Official Briefing, October 9, 2026).

---

## Editorial Standards & Corrections

*Perspectives* is an independent editorial platform published by Lokesh Sain. If you spot a factual error or have verified updates regarding company actions or government directives, please send a note directly to **iamlokeshsain@gmail.com** or use the site's [Contact Page](/).

> **Legal Information Disclaimer:** This article provides journalistic reporting, regulatory analysis, and educational information based on public records and verified news as of October 9, 2026. It does not constitute formal legal advice. United States immigration laws are complex and case-specific. Individuals affected by Department of Labor actions should consult a qualified, licensed immigration attorney for individualized legal counsel.`
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in environment");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  const collection = mongoose.connection.collection("articles");

  // Check if article already exists under either the new slug, previous slug, or seeded ID
  const existing = await collection.findOne({
    $or: [
      { slug: INAUGURAL_ARTICLE.slug },
      { slug: "infosys-tcs-wipro-us-perm-suspension-impact-indian-it-workers" },
      { _id: new mongoose.Types.ObjectId("6ac864b94d4aa6216eef8a72") }
    ]
  });

  if (existing) {
    console.log(`Article already exists with id: ${existing._id}. Updating fields and setting status to published...`);
    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          ...INAUGURAL_ARTICLE,
          publishedAt: new Date("2026-10-09T10:00:00.000Z"),
          updatedAt: new Date()
        }
      }
    );
    console.log("Article successfully updated and marked as PUBLISHED.");
  } else {
    const result = await collection.insertOne({
      ...INAUGURAL_ARTICLE,
      publishedAt: new Date("2026-10-09T10:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`Inaugural article created and marked as PUBLISHED with id: ${result.insertedId}`);
  }

  const count = await collection.countDocuments();
  console.log(`Total articles in DB: ${count}`);

  await mongoose.disconnect();
  console.log("Seeding and publication update complete.");
}

seed().catch((err) => {
  console.error("Error seeding inaugural article:", err);
  process.exit(1);
});
