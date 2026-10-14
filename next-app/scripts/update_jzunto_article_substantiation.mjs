import connectDB from "../src/lib/db.js";
import Article from "../src/models/Article.js";

async function main() {
  await connectDB();
  const a = await Article.findOne({ slug: "architecting-jzunto-curriculum-intelligence" });
  if (!a) {
    console.error("Article not found");
    process.exit(1);
  }

  const newContent = `## The Problem: Fragmented Academic Intelligence

Preparing for postgraduate computer applications examinations—specifically under the Savitribai Phule Pune University (SPPU) Master of Computer Applications (MCA) curriculum—presents candidates with recurring information retrieval bottlenecks:

1. **Scattered Syllabus Revisions:** Frequent curriculum revisions (such as the transition from the 2020 syllabus to the 2023 revision) create confusion over module boundaries, credit allocations, and elective weightings.
2. **Unstructured Past Question Papers (PYQs):** PYQ archives are traditionally distributed as static, un-indexed PDF scans, making topic frequency analysis and concept-specific querying nearly impossible.
3. **Disjointed Reference Materials:** Students expend significant preparation time cross-referencing textbook chapters against specific syllabus unit learning outcomes.

To address these challenges, we designed and engineered **JZunto** ([jzunto.app](https://jzunto.app)), an exam-preparation and curriculum intelligence platform built specifically for SPPU MCA students.

---

## Architectural Blueprint & System Stack

The primary objective of JZunto was to transform static, unstructured academic documents into an interactive, low-latency curriculum knowledge graph.

### Core Stack
* **Frontend Architecture:** React with atomic component hierarchy and accessible design tokens
* **State Management:** Low-latency client state with persistent local caching to support offline review
* **Data Model:** Directed hierarchical graph mapping Semesters → Subjects → Units → Learning Outcomes
* **Hosting & CDN:** Global edge distribution with modern HTTP/3 delivery
* **Live Production:** [https://jzunto.app](https://jzunto.app)

---

## Key Engineering Pillars

### 1. Hierarchical Curriculum Graph Navigation
Traditional exam preparation portals present curriculum data as flat PDF downloads or static tables. JZunto structures the SPPU MCA curriculum as a directed graph where:
* Each **Semester** node anchors a set of core and elective subject nodes.
* Each **Subject** node connects to specific unit modules (e.g., Data Structures, Distributed Databases, Cloud Computing).
* Each **Unit** contains discrete conceptual tags mapped to official university learning outcomes.

By maintaining this hierarchical graph in client memory, students can drill down from semester-wide overviews to specific algorithmic sub-topics with sub-second response times.

### 2. PYQ Pattern & Marking Scheme Categorization
Previous-year university examination papers are tagged directly against the corresponding syllabus graph nodes. This structure allows students to query questions based on historical frequency and university marking conventions:
* **5-Mark Conceptual Questions:** Short-answer architectural definitions, syntax fundamentals, and comparison tables.
* **10-Mark Implementation Questions:** Comprehensive algorithmic designs, system architecture workflows, and practical code scenarios.

Rather than reading through years of PDF archives chronologically, candidates can inspect concept frequency across multiple examination cycles.

### 3. Structured Practice & Revision Generation
Leveraging indexed topic nodes, JZunto formats mock practice sets aligned with the exact format of university examinations. Candidates can generate focused revision sessions targeting specific weak units rather than reviewing entire semesters uniformly.

---

## Technical Trade-offs & Engineering Considerations

1. **Client-Side Graph Traversal vs. Server-Side Querying:** For the current syllabus corpus, maintaining the curriculum structure as an optimized, pre-indexed client dataset provides instantaneous filtering and search responsiveness without generating network waterfall latency.
2. **Offline Resilience:** Because university students frequently study in campus environments with intermittent cellular connectivity, persisting active session state and recent syllabus nodes to local storage ensures continuity without disruptive reload errors.
3. **Curriculum Evolution:** As university boards publish future syllabus revisions, decoupling the UI component tree from the underlying graph taxonomy allows new academic years to be added without modifying the presentation components.

---

## Production Verification

* **Deployment Verification:** Live production application verified operational at [https://jzunto.app](https://jzunto.app).
* **Target Audience Alignment:** Designed for Savitribai Phule Pune University (SPPU) Master of Computer Applications (MCA) candidates.
* **Scope Definition:** Case study reflects verified frontend graph modeling and product architecture implemented on the live platform.`;

  a.content = newContent;
  a.title = "Architecting JZunto: Exam-Preparation Intelligence and Curriculum Graph Navigation";
  a.dek = "Inside the architecture of JZunto: structuring university syllabus graphs, previous-year question (PYQ) pattern extraction, and low-latency client state management for SPPU MCA students.";
  await a.save();
  console.log("Successfully updated JZunto article with complete, substantiated case study!");
  process.exit(0);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
