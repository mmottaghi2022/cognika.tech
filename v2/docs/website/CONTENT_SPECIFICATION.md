# Cognika Website v2 — Content Specification

## Overall direction

Cognika is a cognitive engineering and intelligent systems initiative.

Its central idea is to bring cognition into artificial intelligence and agentic solutions: helping people clarify what they want to achieve, translating their ideas into structured engineering requirements, and using intelligent agents to develop and implement solutions.

The website should communicate this philosophy through actual projects and engineering work, rather than generic AI marketing language.

**Tone:** Technical, thoughtful, confident, minimal and forward-looking.

**Writing principles:**
- Avoid exaggerated claims.
- Distinguish working systems, simulations and concepts.
- Do not describe planned features as completed capabilities.
- Preserve the existing Cognika visual identity.
- Use concise text, with technical depth where appropriate.

---

# 1. HOME PAGE `/`

### Main heading
Cognika

### Main statement
Bringing cognition to AI.

### Supporting text
We develop cognitive intelligence for agentic solutions, intelligent software and industrial systems.

Our approach begins with understanding the problem: clarifying ideas, objectives, requirements and constraints before turning them into intelligent solutions.

### Main navigation
- About Cognika
- Projects
- e_os
- pat_ia
- Srm_p
- Contact

### Projects introduction
**Engineering intelligence into real systems.**

Our projects explore how cognitive intelligence, automation and intelligent software can transform the way systems are designed, developed and operated.

---

# 2. ABOUT COGNIKA `/about/`

### Page heading
About Cognika

### Opening statement
**Creating cognition for artificial intelligence.**

### Main content

Artificial intelligence is becoming increasingly capable of performing complex tasks. But effective engineering requires more than execution. It requires understanding.

Cognika explores a different approach to intelligent systems: creating a cognitive layer between human intention and artificial intelligence.

The process begins with understanding the user's idea, objectives, requirements, constraints and concerns. These are organized into a structured representation of the problem, allowing intelligent agents to reason about the task and propose appropriate solutions.

Rather than treating AI as a simple question-and-answer interface, Cognika aims to provide a medium through which people can develop, clarify and implement their ideas using intelligent agents.

### Our approach

**1. Understand**

Help users express their ideas, objectives and concerns, even when they are not professional engineers.

**2. Structure**

Transform discussions into organized requirements, constraints, objectives and risks.

**3. Reason**

Enable intelligent agents to analyze the problem and propose suitable approaches.

**4. Implement**

Use specialized agents, tools and engineering workflows to turn structured ideas into practical solutions.

### Our direction

Cognika focuses on cognitive intelligence, intelligent software and industrial applications.

We believe the next step in agentic systems is not simply making agents more capable, but improving how they understand problems and work toward meaningful objectives.

---

# 3. E_OS — ELEVATOR OPERATING SYSTEM `/e-os/`

### Page heading
e_os

### Subtitle
Elevator Operating System

### Opening statement
An intelligent elevator dispatch system designed to learn building traffic patterns, evaluate service performance and optimize elevator operation.

### Overview

e_os is an intelligent lift dispatch system supported by a dedicated AI agent.

Its optimization process includes a nightly Dream phase, during which the system evaluates operational performance and traffic patterns. Optimization can be triggered when traffic characteristics change or when the system detects deviations from its service-quality objectives.

### Adaptive optimization

The system maintains weekly time-based memory while its local learning mechanism identifies daily traffic patterns across different hours.

This information allows the dispatcher to adapt its operating strategy to changing building conditions.

### Dream phase

During the Dream phase, the agent analyzes operational data and evaluates possible improvements.

Candidate strategies can be tested against a shadow representation of building traffic before being considered for application.

### Intelligent interaction

A conversational interface allows building managers to communicate operational objectives, request analyses and explore alternative scenarios.

### Current development status

The e_os dispatch system has been tested in simulation and is progressing toward on-site testing.

### Important editorial note
Do not claim that the system is already deployed in operational buildings or that all future ESP32/server integration is complete.

---

# 4. PAT_IA — INTELLIGENT BUSINESS SYSTEM `/pa-ia/`

### Page heading
pat_ia

### Subtitle
An intelligent, self-implementing business system

### Opening statement
Rethinking enterprise software through cognitive intelligence and agentic automation.

### Concept

pat_ia explores a different approach to enterprise resource planning.

Traditional ERP systems are generally built around predefined workflows, fixed modules and manually configured business rules.

The pat_ia concept explores an intelligent system capable of understanding business objectives, identifying operational requirements and developing its own structured implementation path.

### Intended direction

The concept is based on a system that can:

- Understand business processes and objectives.
- Identify operational requirements.
- Organize business information and workflows.
- Use intelligent agents to support implementation and automation.
- Adapt its structure as business requirements evolve.

### Vision

The long-term direction is a more intelligent and adaptive business system in which users describe what their organization needs, while cognitive agents help translate those needs into operational software and workflows.

### Important editorial note
This is a project concept. Do not present these capabilities as completed or commercially available features unless separately confirmed.

---

# 5. SRM_P — SYNCHRONOUS RELUCTANCE MOTOR `/srm-p/`

### Page heading
Srm_p

### Subtitle
Synchronous Reluctance Motor Development

### Opening statement
Exploring efficient, robust synchronous reluctance motor technology for industrial applications.

### Overview

Srm_p is an electric motor development project focused on synchronous reluctance technology.

The project explores rotor and stator configurations, electromagnetic performance, torque characteristics and energy efficiency through engineering design and simulation.

### Design direction

The current development work focuses on a four-pole synchronous reluctance positioning motor.

The investigated design includes:

- 150 mm rotor diameter.
- 100 mm stack length.
- Target starting torque of 3 N·m.
- Maximum operating speed of 1,000 rpm.
- Inverter-fed operation.

### Engineering investigation

The development process includes investigation of:

- Rotor geometry and magnetic reluctance.
- Stator and winding configurations.
- Starting torque and torque ripple.
- Electromagnetic simulation.
- Efficiency and operating characteristics.

### Technology perspective

Synchronous reluctance motors offer an alternative to conventional permanent-magnet and asynchronous motor architectures.

The project investigates the potential benefits of avoiding rare-earth permanent magnets, including reduced dependence on magnet materials and avoiding permanent-magnet demagnetization concerns.

The design must also address the engineering challenges of starting torque, torque ripple and control.

### Development status

The motor is under electromagnetic design and simulation.

### Important editorial note
Any efficiency-class result must be described as a simulation result, not a certified IE5 classification. Do not present simulated performance as independently measured hardware performance.

---

# 6. CONTACT `/contact/`

### Page heading
Contact Cognika

### Main text
Have an engineering idea, an intelligent systems project or a potential collaboration?

We are interested in exploring new applications of cognitive intelligence, agentic solutions and industrial automation.

Get in touch to discuss your ideas and projects.

### Contact information
Use only the existing verified Cognika email address and contact channels.

Do not invent telephone numbers, office addresses or social media accounts.

---

# GLOBAL CONTENT AND IMPLEMENTATION RULES

1. Each page must have its own real, crawlable HTML URL.
2. Use one meaningful H1 per page.
3. Use semantic H2 and H3 headings.
4. Keep page titles and meta descriptions unique.
5. Preserve the existing typography, colors, background and visual identity.
6. Use consistent navigation across all pages.
7. Link project pages to one another where relevant.
8. Add breadcrumbs where appropriate.
9. Do not place essential page content exclusively inside JavaScript state.
10. Keep existing PHP authentication unchanged.
11. Do not introduce a new framework or change the deployment architecture.
12. Do not invent project specifications, results, customers, partnerships or certifications.

## Content still requiring owner confirmation

- Official Cognika contact email and social profiles.
- Whether pat_ia should be expanded into a more detailed product description.
- Which SRM simulation results are suitable for public disclosure.
- Whether e_os should publish detailed technical specifications or retain a higher-level public description.