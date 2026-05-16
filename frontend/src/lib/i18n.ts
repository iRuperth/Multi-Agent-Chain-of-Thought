export type Lang = "en" | "es";

export type AgentKey =
  | "interviewer"
  | "market_analyst"
  | "copywriter"
  | "demand_simulator"
  | "policy_validator"
  | "archivist";

export const AGENT_ORDER: AgentKey[] = [
  "interviewer",
  "market_analyst",
  "copywriter",
  "demand_simulator",
  "policy_validator",
  "archivist",
];

type AgentCopy = {
  name: string;
  role: string;
  short: string;
  goal: string;
  logic: string[];
  tools: string;
};

type Bundle = {
  navHome: string;
  navHow: string;
  navPricing: string;
  navContact: string;
  navApi: string;
  enterCta: string;
  backToLanding: string;
  platformTitle: string;
  platformSubtitle: string;
  etaLabel: string;
  etaValue: string;
  etaDemoValue: string;
  tipsTitle: string;
  tipsSubtitle: string;
  tipsItems: string[];
  tipsFooter: string;
  api: {
    eyebrow: string;
    title: string;
    subtitle: string;
    openDocs: string;
    endpointsTitle: string;
    schemaTitle: string;
    schemaDesc: string;
    runtimeTitle: string;
    runtimeItems: string[];
    endpoints: { method: string; path: string; desc: string }[];
  };
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBullet1: string;
  heroBullet2: string;
  heroBullet3: string;
  promptLabel: string;
  promptPlaceholder: string;
  primaryCta: string;
  demoCta: string;
  modeStrictLabel: string;
  modeStrictDesc: string;
  modeCreativeLabel: string;
  modeCreativeDesc: string;
  workingTitle: string;
  workingSubtitle: string;
  workingProgress: (n: number, total: number) => string;
  detailHeading: string;
  agentLogicHeading: string;
  agentToolsHeading: string;
  resultTitle: string;
  resultSubtitle: string;
  missingTitle: string;
  missingSubtitle: string;
  missingHint: string;
  missingFields: Record<string, string>;
  cardMerchant: string;
  cardCategory: string;
  cardGoal: string;
  cardAudience: string;
  cardLocation: string;
  cardCopy: string;
  cardTitle: string;
  cardDescription: string;
  cardConditions: string;
  cardValidity: string;
  cardStock: string;
  cardWeeklyCap: string;
  cardWeeklySlots: string;
  cardFinePrint: string;
  cardPricing: string;
  cardRrp: string;
  cardOfferlyPrice: string;
  cardDiscount: string;
  cardCommission: string;
  cardMargin: string;
  cardMerchantRevenue: string;
  cardVariableCost: string;
  cardSimulation: string;
  cardUnits: string;
  cardProfit: string;
  cardProbProfit: string;
  cardSummary: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  reset: string;
  agents: Record<AgentKey, AgentCopy>;
  examples: string[];
  how: {
    eyebrow: string;
    title: string;
    subtitle: string;
    everyone: string;
    simple: string;
    technical: string;
    everyoneTagline: string;
    simpleTagline: string;
    technicalTagline: string;
    stateTitle: string;
    stateDescEveryone: string;
    stateDescSimple: string;
    stateDescTech: string;
    inputTitle: string;
    inputDesc: string;
    outputTitle: string;
    outputDescEveryone: string;
    outputDescSimple: string;
    outputDescTech: string;
    clickHint: string;
    pickAgent: string;
    exampleHeading: string;
    inputHeading: string;
    outputHeading: string;
    tasksHeading: string;
    promptHeading: string;
    everyoneBlurbs: Record<AgentKey, { analogy: string; example: string }>;
    simpleBlurbs: Record<
      AgentKey,
      { intro: string; example: { input: string; output: string } }
    >;
    technicalBlurbs: Record<
      AgentKey,
      {
        summary: string;
        reads: string;
        writes: string;
        cot: string[];
        prompt?: string;
      }
    >;
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    plans: {
      name: string;
      price: string;
      perWhat: string;
      bullets: string[];
      cta: string;
      featured?: boolean;
    }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    email: string;
    bookLabel: string;
    note: string;
  };
};

export const i18n: Record<Lang, Bundle> = {
  en: {
    navHome: "Home",
    navHow: "How it works",
    navPricing: "Pricing",
    navContact: "Contact",
    navApi: "API",
    enterCta: "Enter the platform",
    backToLanding: "Back to home",
    platformTitle: "New campaign",
    platformSubtitle: "Describe your business and let the six agents do the rest.",
    etaLabel: "Approximate time",
    etaValue: "30–90 s with local LLM",
    etaDemoValue: "~ 8 s in demo mode",
    tipsTitle: "Include these details for the best result",
    tipsSubtitle:
      "The agents will design the offer, discount, copy and forecast on their own. They only need facts they cannot guess about your business:",
    tipsItems: [
      "Business name and what you sell",
      "City and neighborhood",
      "Full price of the service (€)",
      "Your variable cost per session (€)",
      "How many clients you can serve per week",
      "What you'd like the campaign to achieve",
    ],
    tipsFooter:
      "Everything else — discount, slots, copy, projections — the agents decide.",
    heroEyebrow: "Multi-agent merchant onboarding",
    heroTitle: "Launch a promotion in seconds, not weeks.",
    heroSubtitle:
      "Describe your business in one paragraph. Six AI agents collaborate to design copy, recommend a discount, simulate demand and validate platform policies — so your offer is ready to publish.",
    heroBullet1: "Six specialist agents with Chain-of-Thought reasoning",
    heroBullet2: "Monte Carlo demand simulation before you publish",
    heroBullet3: "Built-in policy validation against platform terms",
    promptLabel: "Tell us about your business and what you'd like to promote",
    promptPlaceholder:
      "E.g. I run a wellness spa in Soho. I want to fill Tuesday and Wednesday afternoons with a 60-minute massage offer.",
    primaryCta: "Create my campaign",
    demoCta: "Try demo (no LLM needed)",
    modeStrictLabel: "Customer data only",
    modeStrictDesc:
      "Agents act strictly on the facts you provide. Less variation, fewer surprises.",
    modeCreativeLabel: "Allow agent creativity",
    modeCreativeDesc:
      "Agents can experiment with copy angles and slot choices. More vivid, more variable.",
    workingTitle: "Our agents are working",
    workingSubtitle:
      "Each agent reasons step by step and hands off to the next. Hover for context, click for the full playbook.",
    workingProgress: (n, total) => `Step ${n} of ${total}`,
    detailHeading: "About this agent",
    agentLogicHeading: "Reasoning loop",
    agentToolsHeading: "Tools",
    resultTitle: "Your campaign sheet",
    resultSubtitle:
      "Ready to review with your team. Edit anything before publishing.",
    missingTitle: "Some data is missing",
    missingSubtitle:
      "The agents will not invent values. To fill these fields, include the following in your description and run it again:",
    missingHint:
      "Tip: use the example chips below the textarea — they include every required data point.",
    missingFields: {
      merchant_name: "Business name (e.g. 'Spa Aurora')",
      business_type: "What kind of business (e.g. 'wellness spa')",
      city: "City",
      neighborhood: "Neighborhood",
      category: "Business category",
      goal: "Goal of the campaign",
      target_audience: "Who you're targeting",
      "pricing.pvp_eur": "Full price of the service (€)",
      "pricing.variable_cost_eur": "Your variable cost per session (€)",
      weekly_capacity: "Clients you can serve per week",
    },
    cardMerchant: "Merchant",
    cardCategory: "Category",
    cardGoal: "Goal",
    cardAudience: "Target audience",
    cardLocation: "Location",
    cardCopy: "Marketing copy",
    cardTitle: "Title",
    cardDescription: "Description",
    cardConditions: "Conditions",
    cardValidity: "Voucher validity",
    cardStock: "Stock",
    cardWeeklyCap: "Weekly capacity",
    cardWeeklySlots: "Available slots",
    cardFinePrint: "Fine print",
    cardPricing: "Pricing & margin",
    cardRrp: "RRP",
    cardOfferlyPrice: "Offerly price",
    cardDiscount: "Discount",
    cardCommission: "Commission",
    cardMargin: "Margin / unit",
    cardMerchantRevenue: "Merchant revenue / unit",
    cardVariableCost: "Variable cost",
    cardSimulation: "Demand simulation",
    cardUnits: "Units sold (p10 / p50 / p90)",
    cardProfit: "Profit € (p10 / p50 / p90)",
    cardProbProfit: "Probability profitable",
    cardSummary: "Agent summary",
    errorTitle: "Something went wrong",
    errorBody:
      "We couldn't complete the run. Check that Ollama is running, or try the demo mode below.",
    retry: "Try again",
    reset: "Start over",
    agents: {
      interviewer: {
        name: "Interviewer",
        role: "Conversational intake",
        short: "Extracts merchant intent from the free-text pitch.",
        goal:
          "Turn a free-form description into structured fields: business, location, category, goal, audience.",
        logic: [
          "Observe the merchant's words and tone",
          "Identify missing fields essential for a campaign",
          "Match the business to a known platform category",
          "Write findings into the shared campaign state",
        ],
        tools: "update_campaign, get_campaign",
      },
      market_analyst: {
        name: "Market Analyst",
        role: "Discount strategy",
        short: "Recommends an optimal discount per category and area.",
        goal:
          "Choose a discount that is competitive in the merchant's category without crushing margin.",
        logic: [
          "Read category benchmarks (typical discount, price band)",
          "Cross-check with neighborhood and audience",
          "Propose RRP, Offerly price, commission and variable cost",
          "Persist the pricing block to the campaign",
        ],
        tools: "category_benchmarks, update_campaign",
      },
      copywriter: {
        name: "Copy Creative",
        role: "Persuasive copy",
        short: "Drafts a title, hook and description that converts.",
        goal:
          "Produce a short title and a description that highlights the value while staying within platform policy.",
        logic: [
          "Read intent and pricing decisions",
          "Pick a hook angle that matches the audience",
          "Write a title (≤ 70 chars) and a 3–4 sentence description",
          "Avoid banned claims (miracles, guarantees, medical promises)",
        ],
        tools: "update_campaign, get_campaign",
      },
      demand_simulator: {
        name: "Demand Simulator",
        role: "Monte Carlo forecast",
        short: "Rolls the dice 5,000 times to estimate units and profit.",
        goal:
          "Quantify the uncertainty: units sold (p10/p50/p90), profit and probability of being profitable.",
        logic: [
          "Sample demand from the category prior",
          "Apply price elasticity and capacity caps",
          "Aggregate 5,000 scenarios into percentiles",
          "Flag if the campaign is likely to lose money",
        ],
        tools: "simulate_demand",
      },
      policy_validator: {
        name: "Policy Validator",
        role: "Compliance gate",
        short: "Checks the campaign against platform terms before publish.",
        goal:
          "Block anything that violates terms — illegal claims, missing fine print, sub-minimum margins.",
        logic: [
          "Scan copy for banned terms",
          "Verify voucher validity is within allowed window",
          "Verify margin meets the platform floor",
          "Either approve or list required fixes",
        ],
        tools: "validate_policies",
      },
      archivist: {
        name: "Archivist",
        role: "Persist & export",
        short: "Serializes the final campaign sheet to JSON and Markdown.",
        goal:
          "Produce a tamper-evident artifact your team can share, review and edit.",
        logic: [
          "Pull the final campaign from shared state",
          "Render Markdown in the active language",
          "Write JSON next to it for downstream tooling",
          "Return the artifact paths",
        ],
        tools: "get_campaign, export_campaign",
      },
    },
    examples: [
      "Business name: Spa Aurora. Business type: wellness spa. City: Madrid. Neighborhood: Soho. Service: 60-minute Swedish massage with aromatherapy in private cabins. Full price (RRP): 70€ per session. Variable cost: 18€ per session. Weekly capacity: 40 sessions. Goal: fill empty Tuesday and Wednesday afternoons. Target audience: professionals aged 28–45 looking for mid-week downtime.",
      "Business name: Trattoria Buona Sera. Business type: Italian restaurant. City: Madrid. Neighborhood: Malasaña. Service: tasting menu for two with 4 courses plus a glass of wine. Full price (RRP): 65€ per person. Variable cost: 22€ per cover. Weekly capacity: 50 covers. Goal: fill slow mid-week dinners on Wednesdays and Thursdays. Target audience: couples 30–55 looking for an intimate weeknight dinner.",
      "Business name: Estudio Equilibrio. Business type: Pilates studio. City: Madrid. Neighborhood: Chamberí. Service: intro pack of 3 Pilates classes for new clients. Full price (RRP): 60€. Variable cost: 8€ per class. Weekly capacity: 30 new clients per month. Goal: attract first-time clients who later convert into monthly memberships. Target audience: residents 25–50 new to Pilates wanting to try it before committing.",
    ],
    how: {
      eyebrow: "How it works",
      title: "Six agents, one shared workspace.",
      subtitle:
        "Imagine a small agency where six people work together to design a promotion. Pick a level below to see how it works.",
      everyone: "For everyone",
      simple: "Simple",
      technical: "Technical",
      everyoneTagline: "Like explaining it to a friend over coffee. No jargon.",
      simpleTagline: "A clear walkthrough with a real example for each step.",
      technicalTagline: "Engineering details: agents, prompts, schemas, tools.",
      stateTitle: "Campaign State",
      stateDescEveryone:
        "Think of it as a shared folder on the table. Everyone takes the folder, adds their page, and passes it on.",
      stateDescSimple:
        "A single sheet that all six agents read and write to. It always holds the latest version of the campaign.",
      stateDescTech:
        "A single Pydantic model (offerly.domain.campaign.Campaign) updated via deep-merge. Source of truth for the run. After each writer agent a guardrail re-reads it to verify the agent's required fields are present; if not, CrewAI re-prompts the agent with explicit feedback (max 2 retries).",
      inputTitle: "What the merchant says",
      inputDesc: "One paragraph of text. Just like a phone call.",
      outputTitle: "What you get",
      outputDescEveryone:
        "A neat one-page sheet with the offer, the price, who it's for and the small print. Ready to publish.",
      outputDescSimple:
        "A campaign sheet with copy, pricing, conditions and a profit forecast. You can download it and edit it.",
      outputDescTech:
        "campaign_<slug>.json + campaign_<slug>.md written to ./out/. Same schema as the runtime model. SSE stream exposes per-agent events (started/completed/log/done) for the frontend.",
      clickHint: "Click an agent to see how that step works",
      pickAgent: "Pick an agent above to see what it does.",
      exampleHeading: "Worked example — a spa in Soho",
      inputHeading: "Input",
      outputHeading: "Output",
      tasksHeading: "What it does",
      promptHeading: "Prompt scaffolding",
      everyoneBlurbs: {
        interviewer: {
          analogy:
            "The friendly receptionist. They listen to your story, write down the important bits and ask questions if something is missing.",
          example:
            "You say: 'I have a spa in Soho and I want to fill Tuesday afternoons.' The receptionist writes down: business = spa, area = Soho, what you want = fill Tuesday afternoons.",
        },
        market_analyst: {
          analogy:
            "The neighbour who knows every shop on the street. They know what other spas charge and how much a discount usually is.",
          example:
            "They look at other spas in similar areas and suggest: 'Sell the 70€ massage for 35€. People love that kind of discount and you still earn money.'",
        },
        copywriter: {
          analogy:
            "The friend who's great at writing. They take the plain idea and make it sound attractive without lying.",
          example:
            "Plain idea: '60-minute massage offer.' What they write: '60-min Swedish massage in Soho — relax after work.' Same thing, but it makes you want to book.",
        },
        demand_simulator: {
          analogy:
            "The fortune-teller who's secretly a maths nerd. They run thousands of imaginary weeks and tell you what's most likely to happen.",
          example:
            "They imagine 5,000 different weeks. In most of them, about 80 people buy the voucher and the spa makes around 240€ profit. That's the forecast.",
        },
        policy_validator: {
          analogy:
            "The careful lawyer. They read every word looking for promises that could get you in trouble.",
          example:
            "If the copy said 'miracle treatment, guaranteed!' the lawyer would cross it out. They make sure the offer follows the rules before it goes live.",
        },
        archivist: {
          analogy:
            "The tidy secretary. They take the final folder, put a clean cover on it and file it where everyone can find it.",
          example:
            "They save the finished offer as a one-page sheet you can open later, edit if you want, or paste into your team's chat.",
        },
      },
      simpleBlurbs: {
        interviewer: {
          intro:
            "Reads the merchant's pitch and turns free text into clean fields: business, location, category, goal and target audience. If something important is missing, it leaves a note.",
          example: {
            input:
              "I run a wellness spa in Soho. I want to fill Tuesday and Wednesday afternoons with a 60-minute massage offer.",
            output:
              "business: spa · neighborhood: Soho · category: spa_beauty · goal: fill Tue/Wed afternoons · target audience: mid-week downtime seekers",
          },
        },
        market_analyst: {
          intro:
            "Looks up typical discounts and price ranges for that kind of business and area, then proposes a price that's attractive without destroying the merchant's margin.",
          example: {
            input: "category: spa_beauty · location: Soho",
            output:
              "RRP 70€ · Offerly price 35€ (50% off) · platform commission 40% · variable cost 18€ · margin per unit 3€",
          },
        },
        copywriter: {
          intro:
            "Writes a short title (max 70 characters) and a 3–4 sentence description that highlights the value without breaking the rules.",
          example: {
            input: "Offer: 60-min massage, 35€ in Soho",
            output:
              "Title: '60-min Swedish massage in Soho — relax after work'. Description tells the story: cabin, oils, easy booking, perfect mid-week.",
          },
        },
        demand_simulator: {
          intro:
            "Runs 5,000 simulated weeks. Each one rolls the dice on how many people see the offer, how many buy, and how much profit ends up on the table. Returns the optimistic, middle and pessimistic outcomes.",
          example: {
            input: "Price 35€ · capacity 40/week · stock 80",
            output:
              "Pessimistic: 62 units · Middle: 78 units · Optimistic: 80 (stock cap). Profit forecast: ~228€. Chance of making money: 94%.",
          },
        },
        policy_validator: {
          intro:
            "Acts like the platform's compliance team. Scans the copy and pricing for banned claims, missing fine print, and margins below the floor. Either approves or returns a list of fixes.",
          example: {
            input: "Title, description, fine print and pricing block.",
            output:
              "✓ no banned claims  ✓ fine print present  ✓ voucher validity within window  ✓ margin > 0 → APPROVED",
          },
        },
        archivist: {
          intro:
            "Takes the final campaign and saves it in two formats: a machine-readable file your team's tools can import, and a clean one-page summary anyone can read.",
          example: {
            input: "Final Campaign state.",
            output:
              "Two files written: out/campaign_aurora_reset_massage.json (for tools) and out/campaign_aurora_reset_massage.md (for humans).",
          },
        },
      },
      technicalBlurbs: {
        interviewer: {
          summary:
            "CrewAI Agent (allow_delegation=False) driven by ollama_chat/qwen2.5:14b via LiteLLM at temperature 0.0 (strict) or 0.6 (creative). Tool set: [update_campaign] only — no get_campaign because the state is empty at start. Wrapped by a Task guardrail with guardrail_max_retries=2 that re-prompts the agent if merchant_name/business_type/category are still null after the run.",
          reads: "merchant_input (str), CATEGORIES (list of category keys)",
          writes:
            "Campaign.merchant_name · business_type · city · neighborhood · category · goal · target_audience · weekly_capacity · pricing.pvp_eur · pricing.variable_cost_eur",
          cot: [
            "PARSE — Read the merchant pitch verbatim.",
            "MAP — Translate business_type to one of the seven canonical category keys.",
            "EXTRACT — Pull only fields the merchant explicitly mentioned (no invention).",
            "INVOKE — Call update_campaign(patch_json=…) exactly once.",
            "GUARDRAIL — Validator re-reads the state; if missing required fields, retry with feedback.",
          ],
          prompt:
            "Imperative description: 'REQUIRED: you MUST invoke update_campaign. Do not produce a Final Answer until update_campaign has returned successfully.' expected_output asks for the JSON returned by the tool — only satisfiable after a real invocation, closes the 'final answer as text' escape hatch.",
        },
        market_analyst: {
          summary:
            "Second task. context=[intake] is materialised manually by the runner because Task.execute_sync() does NOT auto-resolve context outside Crew.kickoff(). Tool set: [category_benchmarks, update_campaign]. Same Task guardrail wrapper (retries=2) that fails the agent if offerly_price/stock/weekly_slots are still empty.",
          reads:
            "Campaign.category and pricing.pvp_eur (read from the intake task's text output, not from get_campaign) · domain.categories.CATEGORIES[cat]",
          writes:
            "Campaign.pricing.offerly_price_eur · stock · voucher_validity_days · weekly_slots · pricing.commission_pct (40)",
          cot: [
            "READ_CONTEXT — Extract category + pvp_eur from upstream task text.",
            "BENCHMARK — Invoke category_benchmarks for the typical discount band.",
            "PRICE — Pick a discount in-band, compute offerly_price = round(pvp × (1−d), 2).",
            "OPS — Pick stock (20…10×capacity), validity (60–365, default 120), ≥3 weekly_slots.",
            "INVOKE — update_campaign with the patch. Guardrail enforces all required fields landed.",
          ],
        },
        copywriter: {
          summary:
            "Third task. context=[intake, pricing]. The runner additionally HARD-ANCHORS merchant_name/business_type/category/city/neighborhood at the very top of the prompt before execute_sync() — this neutralises the small-LLM prior that otherwise drifts toward generic 'spa wellness' copy regardless of the real business. Tool set: [update_campaign] only. Guardrail retries (=2) if title/description are still empty.",
          reads:
            "Anchor block (literal merchant_name + business_type + city + neighborhood) · downstream context text",
          writes:
            "Campaign.offer_name · title (≤70 chars) · description (150–600 chars) · fine_print (2–4 strings)",
          cot: [
            "ANCHOR — Prompt opens with 'YOU MUST WRITE COPY FOR THIS EXACT BUSINESS: …'.",
            "MATCH — Service described must match business_type literally; no genre drift.",
            "BANNED — Avoid superlatives ('best', '#1', 'miraculous') per the i18n banned list.",
            "INVOKE — update_campaign with offer_name + title + description + fine_print.",
            "GUARDRAIL — Validator checks title/description present in the state.",
          ],
        },
        demand_simulator: {
          summary:
            "Fourth task. Tool set: [simulate_demand] only. The tool REFUSES to run when pricing.pvp_eur / offerly_price_eur / variable_cost_eur are missing — returns {skipped: true, reason} instead of fabricating a benchmark-fallback forecast (an older bug that produced fake −€790 losses). No guardrail wrapper: this task is allowed to skip cleanly.",
          reads:
            "Campaign.pricing.* · category · weekly_capacity · stock",
          writes:
            "Campaign.simulation = SimulationResult(units_p10/50/90, profit_p10/50/90, probability_profitable) — OR null when pricing is incomplete.",
          cot: [
            "READ — Pull pricing and capacity envelope from the shared state.",
            "GATE — If any pricing field missing, return skipped=true (no fake numbers).",
            "ROLL — 2000 trials × log-linear price elasticity × stock/capacity cap.",
            "STORE — Direct write to campaign.simulation (bypasses deep-merge).",
          ],
        },
        policy_validator: {
          summary:
            "Fifth task. context=[copy, simulate]. Tool set: [validate_policies, get_campaign]. Reads numeric thresholds from offerly.domain.policies and locale-specific banned-term regex lists from the i18n bundle. Pure read + verdict, never mutates the campaign.",
          reads:
            "Campaign.title · description · fine_print · pricing.* · simulation.* · domain.policies.thresholds",
          writes: "Verdict report only — does not patch the campaign.",
          cot: [
            "SCAN — Regex over title/description/fine_print for banned terms.",
            "MATH — Pricing.margin_per_unit ≥ category floor.",
            "OPS — voucher_validity in window, ≥3 weekly_slots, stock cap respected.",
            "VERDICT — PASS or list of actionable errors.",
          ],
        },
        archivist: {
          summary:
            "Sixth and final task. Tool set: [get_campaign, export_campaign]. Prompt is intentionally short ('Invoke export_campaign with out_dir=out. That is all.') to prevent the small LLM from narrating its plan instead of acting. No LLM creativity needed.",
          reads: "Final Campaign instance (all fields).",
          writes:
            "out/campaign_<slug>.json (Campaign.model_dump_json) · out/campaign_<slug>.md (Campaign.render_markdown(lang))",
          cot: [
            "SLUG — offer_name → merchant_name → 'campaign'.",
            "INVOKE — export_campaign(out_dir='out').",
            "RETURN — File paths + one-line confirmation.",
          ],
        },
      },
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Pay only when an offer goes live.",
      subtitle:
        "No seat licenses. No setup fees. The platform takes a flat commission on what your campaign actually sells.",
      plans: [
        {
          name: "Starter",
          price: "0€",
          perWhat: "/ month + 40% commission",
          bullets: [
            "Up to 3 active offers",
            "All 6 agents",
            "JSON & Markdown export",
            "Email support",
          ],
          cta: "Get started",
        },
        {
          name: "Growth",
          price: "49€",
          perWhat: "/ month + 35% commission",
          bullets: [
            "Unlimited offers",
            "Policy customization",
            "Webhook integrations",
            "Priority support",
          ],
          cta: "Start free trial",
          featured: true,
        },
        {
          name: "Scale",
          price: "Custom",
          perWhat: "negotiated commission",
          bullets: [
            "SSO & audit log",
            "Self-hosted LLM option",
            "Dedicated CSM",
            "SLA 99.9%",
          ],
          cta: "Talk to sales",
        },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Want a 15-minute walkthrough?",
      subtitle:
        "We'll show you a live onboarding with one of your own offers and answer anything your team needs.",
      emailLabel: "Email us",
      email: "hello@offerly.example",
      bookLabel: "Book a call",
      note: "We reply within one business day.",
    },
    api: {
      eyebrow: "API & Backend",
      title: "Built on a typed, streaming HTTP API.",
      subtitle:
        "The platform is a thin Next.js client on top of a FastAPI service. Every onboarding run emits Server-Sent Events you can consume directly.",
      openDocs: "Open Swagger docs",
      endpointsTitle: "Endpoints",
      schemaTitle: "Campaign schema",
      schemaDesc:
        "A single Pydantic model is the contract between the agents, the API and the UI.",
      runtimeTitle: "Runtime",
      runtimeItems: [
        "Python 3.11 · FastAPI · uvicorn",
        "CrewAI orchestrator · 6 sequential tasks with Pydantic guardrails (max 2 retries)",
        "Local LLM via Ollama (qwen2.5:14b by default) routed via LiteLLM + ollama_chat",
        "Manual context wiring around execute_sync() · Copywriter anchor injection",
        "Server-Sent Events for live progress & terminal logs",
        "Stateless job registry · in-memory queue · single-process",
      ],
      endpoints: [
        {
          method: "POST",
          path: "/api/onboard",
          desc: "Create a new onboarding job. Body: { merchant_input, lang, demo }.",
        },
        {
          method: "GET",
          path: "/api/stream/{job_id}",
          desc: "Subscribe to SSE: snapshot, agent_started, agent_completed, log, done, error.",
        },
        {
          method: "GET",
          path: "/api/job/{job_id}",
          desc: "Fetch the final snapshot (campaign + summary) once the run is done.",
        },
        {
          method: "GET",
          path: "/healthz",
          desc: "Liveness probe.",
        },
        {
          method: "GET",
          path: "/static/Offerly.png",
          desc: "Served by the backend's StaticFiles mount.",
        },
      ],
    },
  },
  es: {
    navHome: "Inicio",
    navHow: "Cómo funciona",
    navPricing: "Precios",
    navContact: "Contacto",
    navApi: "API",
    enterCta: "Entrar a la plataforma",
    backToLanding: "Volver al inicio",
    platformTitle: "Nueva campaña",
    platformSubtitle: "Describe tu negocio y deja que los seis agentes hagan el resto.",
    etaLabel: "Tiempo aproximado",
    etaValue: "30–90 s con LLM local",
    etaDemoValue: "~ 8 s en modo demo",
    tipsTitle: "Incluye estos datos para el mejor resultado",
    tipsSubtitle:
      "Los agentes diseñan la oferta, el descuento, el copy y el pronóstico por su cuenta. Solo necesitan los hechos que no pueden adivinar de tu negocio:",
    tipsItems: [
      "Nombre del negocio y qué vendes",
      "Ciudad y barrio",
      "Precio completo del servicio (€)",
      "Tu coste variable por sesión (€)",
      "Cuántos clientes puedes atender por semana",
      "Qué quieres conseguir con la campaña",
    ],
    tipsFooter:
      "El resto — descuento, franjas, copy, previsiones — lo deciden los agentes.",
    heroEyebrow: "Onboarding multi-agente para comercios",
    heroTitle: "Lanza una promoción en segundos, no en semanas.",
    heroSubtitle:
      "Describe tu negocio en un párrafo. Seis agentes de IA colaboran para diseñar el copy, recomendar el descuento, simular la demanda y validar las políticas — y dejar tu oferta lista para publicar.",
    heroBullet1: "Seis agentes especialistas con razonamiento Chain-of-Thought",
    heroBullet2: "Simulación Monte Carlo de la demanda antes de publicar",
    heroBullet3: "Validación de políticas integrada contra los T&C de la plataforma",
    promptLabel: "Cuéntanos sobre tu negocio y qué quieres promocionar",
    promptPlaceholder:
      "Ej. Tengo un spa en Soho. Quiero llenar las tardes de martes y miércoles con una oferta de masaje de 60 minutos.",
    primaryCta: "Crear mi campaña",
    demoCta: "Probar demo (sin LLM)",
    modeStrictLabel: "Solo datos del cliente",
    modeStrictDesc:
      "Los agentes actúan estrictamente sobre los hechos que das. Menos variación, menos sorpresas.",
    modeCreativeLabel: "Permitir creatividad de los agentes",
    modeCreativeDesc:
      "Los agentes pueden experimentar con ángulos de copy y franjas. Más vivo, más variable.",
    workingTitle: "Nuestros agentes están trabajando",
    workingSubtitle:
      "Cada agente razona paso a paso y entrega al siguiente. Pasa el ratón para más contexto, haz clic para ver el playbook completo.",
    workingProgress: (n, total) => `Paso ${n} de ${total}`,
    detailHeading: "Sobre este agente",
    agentLogicHeading: "Ciclo de razonamiento",
    agentToolsHeading: "Herramientas",
    resultTitle: "Tu ficha de campaña",
    resultSubtitle:
      "Lista para revisar con tu equipo. Edita lo que quieras antes de publicar.",
    missingTitle: "Faltan algunos datos",
    missingSubtitle:
      "Los agentes no inventan valores. Para rellenar estos campos, incluye lo siguiente en tu descripción y ejecútalo de nuevo:",
    missingHint:
      "Tip: usa los ejemplos bajo el textarea — incluyen todos los datos necesarios.",
    missingFields: {
      merchant_name: "Nombre del negocio (p.ej. 'Spa Aurora')",
      business_type: "Tipo de negocio (p.ej. 'spa de bienestar')",
      city: "Ciudad",
      neighborhood: "Barrio",
      category: "Categoría del negocio",
      goal: "Objetivo de la campaña",
      target_audience: "A quién va dirigida",
      "pricing.pvp_eur": "Precio completo del servicio (€)",
      "pricing.variable_cost_eur": "Coste variable por sesión (€)",
      weekly_capacity: "Clientes que puedes atender por semana",
    },
    cardMerchant: "Comercio",
    cardCategory: "Categoría",
    cardGoal: "Objetivo",
    cardAudience: "Público objetivo",
    cardLocation: "Ubicación",
    cardCopy: "Copy de marketing",
    cardTitle: "Título",
    cardDescription: "Descripción",
    cardConditions: "Condiciones",
    cardValidity: "Validez del bono",
    cardStock: "Stock",
    cardWeeklyCap: "Capacidad semanal",
    cardWeeklySlots: "Franjas disponibles",
    cardFinePrint: "Letra pequeña",
    cardPricing: "Precios y margen",
    cardRrp: "PVP",
    cardOfferlyPrice: "Precio Offerly",
    cardDiscount: "Descuento",
    cardCommission: "Comisión",
    cardMargin: "Margen / unidad",
    cardMerchantRevenue: "Ingreso comercio / unidad",
    cardVariableCost: "Coste variable",
    cardSimulation: "Simulación de demanda",
    cardUnits: "Unidades vendidas (p10 / p50 / p90)",
    cardProfit: "Beneficio € (p10 / p50 / p90)",
    cardProbProfit: "Probabilidad de rentabilidad",
    cardSummary: "Resumen del crew",
    errorTitle: "Algo ha fallado",
    errorBody:
      "No hemos podido completar la ejecución. Comprueba que Ollama esté corriendo, o prueba el modo demo más abajo.",
    retry: "Reintentar",
    reset: "Empezar de nuevo",
    agents: {
      interviewer: {
        name: "Entrevistador",
        role: "Toma conversacional",
        short: "Extrae la intención del comerciante a partir del texto libre.",
        goal:
          "Convertir una descripción libre en campos estructurados: negocio, ubicación, categoría, objetivo, audiencia.",
        logic: [
          "Observa las palabras y el tono del comerciante",
          "Identifica qué campos esenciales faltan",
          "Encaja el negocio en una categoría conocida de la plataforma",
          "Escribe los hallazgos en el estado compartido de la campaña",
        ],
        tools: "update_campaign, get_campaign",
      },
      market_analyst: {
        name: "Analista de Mercado",
        role: "Estrategia de descuento",
        short: "Recomienda el descuento óptimo por categoría y zona.",
        goal:
          "Elegir un descuento competitivo en la categoría sin destruir el margen.",
        logic: [
          "Lee los benchmarks de la categoría (descuento típico, rango de precio)",
          "Cruza con el barrio y la audiencia",
          "Propone PVP, precio Offerly, comisión y coste variable",
          "Persiste el bloque de precios en la campaña",
        ],
        tools: "category_benchmarks, update_campaign",
      },
      copywriter: {
        name: "Copy Creativo",
        role: "Copy persuasivo",
        short: "Redacta título, gancho y descripción que convierten.",
        goal:
          "Producir un título corto y una descripción que resalte el valor respetando las políticas.",
        logic: [
          "Lee la intención y las decisiones de precio",
          "Elige un gancho que encaje con la audiencia",
          "Escribe un título (≤ 70 car.) y descripción de 3–4 frases",
          "Evita reclamos prohibidos (milagros, garantías, promesas médicas)",
        ],
        tools: "update_campaign, get_campaign",
      },
      demand_simulator: {
        name: "Simulador de Demanda",
        role: "Pronóstico Monte Carlo",
        short: "Tira los dados 5.000 veces para estimar unidades y beneficio.",
        goal:
          "Cuantificar la incertidumbre: unidades (p10/p50/p90), beneficio y probabilidad de rentabilidad.",
        logic: [
          "Muestrea la demanda desde el prior de la categoría",
          "Aplica elasticidad de precio y límites de capacidad",
          "Agrega 5.000 escenarios en percentiles",
          "Avisa si la campaña probablemente pierde dinero",
        ],
        tools: "simulate_demand",
      },
      policy_validator: {
        name: "Validador de Políticas",
        role: "Puerta de compliance",
        short: "Revisa la campaña contra los T&C antes de publicar.",
        goal:
          "Bloquear cualquier cosa que viole los términos — reclamos ilegales, letra pequeña ausente, márgenes bajo mínimo.",
        logic: [
          "Escanea el copy buscando términos prohibidos",
          "Verifica que la validez del bono está dentro de la ventana permitida",
          "Verifica que el margen cumple el suelo de la plataforma",
          "Aprueba o lista las correcciones necesarias",
        ],
        tools: "validate_policies",
      },
      archivist: {
        name: "Archivero",
        role: "Persistencia y exportación",
        short: "Serializa la ficha final a JSON y Markdown.",
        goal:
          "Producir un artefacto trazable que tu equipo pueda compartir, revisar y editar.",
        logic: [
          "Lee la campaña final del estado compartido",
          "Renderiza Markdown en el idioma activo",
          "Escribe JSON junto al Markdown para las herramientas posteriores",
          "Devuelve las rutas de los artefactos",
        ],
        tools: "get_campaign, export_campaign",
      },
    },
    examples: [
      "Nombre del negocio: Spa Aurora. Tipo de negocio: spa de bienestar. Ciudad: Madrid. Barrio: Soho. Servicio: masaje sueco de 60 minutos con aromaterapia en cabinas privadas. Precio completo (PVP): 70€ por sesión. Coste variable: 18€ por sesión. Capacidad semanal: 40 sesiones. Objetivo: llenar las tardes vacías de martes y miércoles. Público objetivo: profesionales de 28–45 años buscando un respiro entre semana.",
      "Nombre del negocio: Trattoria Buona Sera. Tipo de negocio: restaurante italiano. Ciudad: Madrid. Barrio: Malasaña. Servicio: menú degustación para dos con 4 platos y una copa de vino. Precio completo (PVP): 65€ por persona. Coste variable: 22€ por comensal. Capacidad semanal: 50 comensales. Objetivo: llenar las cenas flojas de miércoles y jueves entre semana. Público objetivo: parejas de 30–55 años buscando una cena íntima entre semana.",
      "Nombre del negocio: Estudio Equilibrio. Tipo de negocio: estudio de Pilates. Ciudad: Madrid. Barrio: Chamberí. Servicio: pack intro de 3 clases de Pilates para clientes nuevos. Precio completo (PVP): 60€. Coste variable: 8€ por clase. Capacidad semanal: 30 clientes nuevos al mes. Objetivo: atraer clientes primerizos que luego conviertan en mensualidad. Público objetivo: residentes de 25–50 años nuevos en Pilates que quieran probarlo antes de comprometerse.",
    ],
    how: {
      eyebrow: "Cómo funciona",
      title: "Seis agentes, un espacio compartido.",
      subtitle:
        "Imagina una agencia pequeña donde seis personas trabajan juntas para diseñar una promoción. Elige un nivel para verlo.",
      everyone: "Para todos",
      simple: "Simple",
      technical: "Técnico",
      everyoneTagline: "Como explicárselo a un amigo tomando un café. Sin jerga.",
      simpleTagline: "Un recorrido claro con un ejemplo real para cada paso.",
      technicalTagline: "Detalles de ingeniería: agentes, prompts, esquemas, tools.",
      stateTitle: "Estado de Campaña",
      stateDescEveryone:
        "Piénsalo como una carpeta compartida sobre la mesa. Cada uno la coge, añade su página y la pasa al siguiente.",
      stateDescSimple:
        "Una única ficha que los seis agentes leen y escriben. Siempre contiene la versión más reciente de la campaña.",
      stateDescTech:
        "Un único modelo Pydantic (offerly.domain.campaign.Campaign) actualizado mediante deep-merge. Fuente de verdad de la ejecución. Tras cada agente de escritura, un guardrail relee el estado y verifica que sus campos requeridos están presentes; si no, CrewAI re-prompt al agente con feedback explícito (máx. 2 reintentos).",
      inputTitle: "Lo que dice el comerciante",
      inputDesc: "Un párrafo de texto. Como una llamada de teléfono.",
      outputTitle: "Lo que recibes",
      outputDescEveryone:
        "Una hoja ordenada de una página con la oferta, el precio, el público objetivo y la letra pequeña. Lista para publicar.",
      outputDescSimple:
        "Una ficha de campaña con copy, precios, condiciones y un pronóstico de beneficio. Puedes descargarla y editarla.",
      outputDescTech:
        "campaign_<slug>.json + campaign_<slug>.md escritos en ./out/. Mismo schema que el modelo en runtime. Stream SSE expone eventos por agente (started/completed/log/done) consumidos por el frontend.",
      clickHint: "Haz clic en un agente para ver cómo funciona ese paso",
      pickAgent: "Elige un agente arriba para ver qué hace.",
      exampleHeading: "Ejemplo práctico — un spa en Soho",
      inputHeading: "Entrada",
      outputHeading: "Salida",
      tasksHeading: "Qué hace",
      promptHeading: "Andamiaje del prompt",
      everyoneBlurbs: {
        interviewer: {
          analogy:
            "El recepcionista amable. Escucha tu historia, anota lo importante y pregunta si falta algo.",
          example:
            "Tú dices: 'Tengo un spa en Soho y quiero llenar las tardes de los martes.' El recepcionista anota: negocio = spa, zona = Soho, lo que quieres = llenar tardes de martes.",
        },
        market_analyst: {
          analogy:
            "El vecino que conoce todas las tiendas de la calle. Sabe cuánto cobran otros spas y cuánto suele ser un buen descuento.",
          example:
            "Mira otros spas en zonas parecidas y sugiere: 'Vende el masaje de 70€ a 35€. A la gente le encanta ese tipo de descuento y aun así ganas dinero.'",
        },
        copywriter: {
          analogy:
            "El amigo que escribe muy bien. Coge la idea seca y la hace sonar atractiva sin mentir.",
          example:
            "Idea seca: 'Oferta de masaje de 60 minutos.' Lo que escribe: 'Masaje sueco de 60 min en Soho — relaja después del trabajo.' Es lo mismo, pero da ganas de reservar.",
        },
        demand_simulator: {
          analogy:
            "El adivino que en realidad es un crack de las matemáticas. Imagina miles de semanas y te dice qué es lo más probable que pase.",
          example:
            "Imagina 5.000 semanas distintas. En la mayoría, unas 80 personas compran el bono y el spa gana unos 240€. Ese es el pronóstico.",
        },
        policy_validator: {
          analogy:
            "El abogado cuidadoso. Lee cada palabra buscando promesas que puedan meterte en problemas.",
          example:
            "Si el copy dijera 'tratamiento milagroso, ¡garantizado!', el abogado lo tacharía. Se asegura de que la oferta cumple las reglas antes de salir.",
        },
        archivist: {
          analogy:
            "La secretaria ordenada. Coge la carpeta final, le pone una portada limpia y la archiva donde todos la encuentren.",
          example:
            "Guarda la oferta terminada como una hoja de una página que puedes abrir luego, editar si quieres, o pegar en el chat de tu equipo.",
        },
      },
      simpleBlurbs: {
        interviewer: {
          intro:
            "Lee el pitch del comerciante y convierte el texto libre en campos limpios: negocio, ubicación, categoría, objetivo y audiencia. Si falta algo importante, lo anota.",
          example: {
            input:
              "Tengo un spa en Soho. Quiero llenar las tardes de martes y miércoles con un masaje de 60 minutos.",
            output:
              "negocio: spa · barrio: Soho · categoría: spa_beauty · objetivo: llenar martes/miércoles tarde · audiencia: clientes entre semana",
          },
        },
        market_analyst: {
          intro:
            "Consulta los descuentos típicos y los rangos de precio para ese tipo de negocio y zona, y propone un precio atractivo sin destruir el margen del comerciante.",
          example: {
            input: "categoría: spa_beauty · ubicación: Soho",
            output:
              "PVP 70€ · Precio Offerly 35€ (50% descuento) · comisión 40% · coste variable 18€ · margen por unidad 3€",
          },
        },
        copywriter: {
          intro:
            "Escribe un título corto (máx. 70 caracteres) y una descripción de 3–4 frases que resalta el valor sin romper las reglas.",
          example: {
            input: "Oferta: masaje 60 min, 35€ en Soho",
            output:
              "Título: 'Masaje sueco de 60 min en Soho — relaja después del trabajo'. Descripción: cabina privada, aceites naturales, reserva online, ideal entre semana.",
          },
        },
        demand_simulator: {
          intro:
            "Corre 5.000 semanas simuladas. Cada una tira los dados sobre cuánta gente ve la oferta, cuántos compran y cuánto beneficio queda. Devuelve los escenarios optimista, medio y pesimista.",
          example: {
            input: "Precio 35€ · capacidad 40/semana · stock 80",
            output:
              "Pesimista: 62 unidades · Medio: 78 · Optimista: 80 (tope de stock). Beneficio previsto: ~228€. Probabilidad de rentabilidad: 94%.",
          },
        },
        policy_validator: {
          intro:
            "Actúa como el equipo de compliance de la plataforma. Escanea el copy y los precios buscando reclamos prohibidos, letra pequeña ausente y márgenes por debajo del suelo. O aprueba o devuelve una lista de correcciones.",
          example: {
            input: "Título, descripción, letra pequeña y bloque de precios.",
            output:
              "✓ sin claims prohibidos  ✓ letra pequeña presente  ✓ validez del bono dentro de ventana  ✓ margen > 0 → APROBADO",
          },
        },
        archivist: {
          intro:
            "Coge la campaña final y la guarda en dos formatos: un archivo que las herramientas de tu equipo pueden importar y una hoja resumen de una página que cualquiera puede leer.",
          example: {
            input: "Estado Campaign final.",
            output:
              "Dos archivos escritos: out/campaign_aurora_reset_massage.json (para herramientas) y out/campaign_aurora_reset_massage.md (para humanos).",
          },
        },
      },
      technicalBlurbs: {
        interviewer: {
          summary:
            "Agente CrewAI (allow_delegation=False) movido por ollama_chat/qwen2.5:14b vía LiteLLM a temperatura 0.0 (estricto) o 0.6 (creativo). Tools: [update_campaign] únicamente — no get_campaign, el estado está vacío al inicio. La Task lleva un guardrail Pydantic (guardrail_max_retries=2) que re-prompt al agente si merchant_name/business_type/category siguen null tras la ejecución.",
          reads: "merchant_input (str), CATEGORIES (lista de keys de categoría)",
          writes:
            "Campaign.merchant_name · business_type · city · neighborhood · category · goal · target_audience · weekly_capacity · pricing.pvp_eur · pricing.variable_cost_eur",
          cot: [
            "PARSEAR — Leer el pitch del comerciante tal cual.",
            "MAPEAR — Traducir business_type a una de las siete keys de categoría canónicas.",
            "EXTRAER — Solo campos que el comerciante mencionó explícitamente (no inventar).",
            "INVOCAR — Llamar update_campaign(patch_json=…) exactamente una vez.",
            "GUARDRAIL — El validador relee el estado; si faltan campos, reintenta con feedback.",
          ],
          prompt:
            "Descripción imperativa: 'OBLIGATORIO: DEBES invocar update_campaign. No produzcas Final Answer hasta que update_campaign haya devuelto con éxito.' El expected_output pide el JSON devuelto por la tool — solo satisfacible tras invocación real.",
        },
        market_analyst: {
          summary:
            "Segunda task. task.context=[intake] se materializa manualmente en el runner porque execute_sync() NO resuelve el contexto fuera de Crew.kickoff(). Tools: [category_benchmarks, update_campaign]. Mismo guardrail wrapper (retries=2) que falla la task si offerly_price/stock/weekly_slots siguen vacíos.",
          reads:
            "Campaign.category y pricing.pvp_eur (leídos del texto de salida de la task de intake, no de get_campaign) · domain.categories.CATEGORIES[cat]",
          writes:
            "Campaign.pricing.offerly_price_eur · stock · voucher_validity_days · weekly_slots · pricing.commission_pct (40)",
          cot: [
            "LEER_CONTEXTO — Extraer category + pvp_eur del texto de la task previa.",
            "BENCHMARK — Invocar category_benchmarks para la banda típica de descuento.",
            "PRECIO — Elegir descuento dentro del rango; offerly_price = round(pvp × (1−d), 2).",
            "OPS — Elegir stock (20…10×capacidad), validez (60–365, defecto 120), ≥3 weekly_slots.",
            "INVOCAR — update_campaign con el patch. El guardrail comprueba que todos los campos requeridos están.",
          ],
        },
        copywriter: {
          summary:
            "Tercera task. context=[intake, pricing]. El runner ANCLA merchant_name/business_type/category/city/neighborhood al inicio del prompt antes de execute_sync() — esto neutraliza el prior del LLM pequeño que tiende a derivar a copy genérico de 'spa wellness' sin importar el negocio real. Tools: [update_campaign] únicamente. Guardrail con retries=2 si title/description siguen vacíos.",
          reads:
            "Bloque ancla (merchant_name + business_type + city + neighborhood literales) · texto del contexto downstream",
          writes:
            "Campaign.offer_name · title (≤70 car.) · description (150–600 car.) · fine_print (2–4 strings)",
          cot: [
            "ANCLA — El prompt abre con 'DEBES ESCRIBIR COPY PARA ESTE NEGOCIO EXACTO: …'.",
            "MATCH — El servicio descrito debe coincidir literalmente con business_type; sin deriva de género.",
            "PROHIBIDOS — Evitar superlativos ('mejor', '#1', 'milagroso') de la lista i18n.",
            "INVOCAR — update_campaign con offer_name + title + description + fine_print.",
            "GUARDRAIL — Validador comprueba título/description presentes en el estado.",
          ],
        },
        demand_simulator: {
          summary:
            "Cuarta task. Tools: [simulate_demand] únicamente. La tool RECHAZA correr cuando pricing.pvp_eur / offerly_price_eur / variable_cost_eur faltan — devuelve {skipped: true, reason} en vez de fabricar un pronóstico desde benchmarks (un bug antiguo que producía pérdidas falsas de −€790). Sin guardrail wrapper: esta task se permite saltarse limpiamente.",
          reads:
            "Campaign.pricing.* · category · weekly_capacity · stock",
          writes:
            "Campaign.simulation = SimulationResult(units_p10/50/90, profit_p10/50/90, probability_profitable) — O null cuando el pricing está incompleto.",
          cot: [
            "LEER — Pricing y límites de capacidad del estado compartido.",
            "GATE — Si falta algún campo de pricing, devolver skipped=true (sin números falsos).",
            "TIRAR — 2000 trials × elasticidad de precio log-lineal × tope de stock/capacidad.",
            "GUARDAR — Escritura directa a campaign.simulation (bypasa el deep-merge).",
          ],
        },
        policy_validator: {
          summary:
            "Quinta task. context=[copy, simulate]. Tools: [validate_policies, get_campaign]. Lee thresholds numéricos de offerly.domain.policies y listas regex de términos prohibidos por locale desde el bundle i18n. Solo lee y emite veredicto, nunca muta la campaña.",
          reads:
            "Campaign.title · description · fine_print · pricing.* · simulation.* · domain.policies.thresholds",
          writes: "Informe de veredicto únicamente — no parchea la campaña.",
          cot: [
            "ESCANEAR — Regex sobre title/description/fine_print para términos prohibidos.",
            "MATEMÁTICA — Pricing.margin_per_unit ≥ suelo de categoría.",
            "OPS — voucher_validity dentro de ventana, ≥3 weekly_slots, stock respetado.",
            "VEREDICTO — PASS o lista de errores accionables.",
          ],
        },
        archivist: {
          summary:
            "Sexta y última task. Tools: [get_campaign, export_campaign]. El prompt es intencionalmente corto ('Invoca export_campaign con out_dir=out. Eso es todo.') para evitar que el LLM pequeño narre su plan en vez de actuar. Sin creatividad LLM requerida.",
          reads: "Instancia final de Campaign (todos los campos).",
          writes:
            "out/campaign_<slug>.json (Campaign.model_dump_json) · out/campaign_<slug>.md (Campaign.render_markdown(lang))",
          cot: [
            "SLUG — Derivado de offer_name → merchant_name → 'campaign'.",
            "INVOCAR — export_campaign(out_dir='out').",
            "DEVOLVER — Rutas de archivos + confirmación de una línea.",
          ],
        },
      },
    },
    pricing: {
      eyebrow: "Precios",
      title: "Paga solo cuando una oferta se publica.",
      subtitle:
        "Sin licencias por usuario. Sin costes de setup. La plataforma cobra una comisión plana sobre lo que tu campaña realmente vende.",
      plans: [
        {
          name: "Starter",
          price: "0€",
          perWhat: "/ mes + 40% comisión",
          bullets: [
            "Hasta 3 ofertas activas",
            "Los 6 agentes",
            "Exportación JSON & Markdown",
            "Soporte por email",
          ],
          cta: "Empezar",
        },
        {
          name: "Growth",
          price: "49€",
          perWhat: "/ mes + 35% comisión",
          bullets: [
            "Ofertas ilimitadas",
            "Políticas personalizables",
            "Integraciones webhook",
            "Soporte prioritario",
          ],
          cta: "Probar gratis",
          featured: true,
        },
        {
          name: "Scale",
          price: "A medida",
          perWhat: "comisión negociada",
          bullets: [
            "SSO y audit log",
            "LLM self-hosted",
            "CSM dedicado",
            "SLA 99,9%",
          ],
          cta: "Hablar con ventas",
        },
      ],
    },
    contact: {
      eyebrow: "Contacto",
      title: "¿Quieres una demo de 15 minutos?",
      subtitle:
        "Te enseñamos un onboarding en vivo con una de tus propias ofertas y respondemos lo que tu equipo necesite.",
      emailLabel: "Escríbenos",
      email: "hello@offerly.example",
      bookLabel: "Reservar llamada",
      note: "Respondemos en menos de un día laboral.",
    },
    api: {
      eyebrow: "API y Backend",
      title: "Construido sobre una API HTTP tipada con streaming.",
      subtitle:
        "La plataforma es un cliente Next.js fino sobre un servicio FastAPI. Cada ejecución emite Server-Sent Events que puedes consumir directamente.",
      openDocs: "Abrir docs Swagger",
      endpointsTitle: "Endpoints",
      schemaTitle: "Esquema Campaign",
      schemaDesc:
        "Un único modelo Pydantic es el contrato entre los agentes, la API y la UI.",
      runtimeTitle: "Runtime",
      runtimeItems: [
        "Python 3.11 · FastAPI · uvicorn",
        "Orquestador CrewAI · 6 tasks secuenciales con guardrails Pydantic (máx. 2 reintentos)",
        "LLM local vía Ollama (qwen2.5:14b por defecto) ruteado por LiteLLM + ollama_chat",
        "Materialización manual del contexto en execute_sync() · ancla del Copywriter",
        "Server-Sent Events para progreso y terminal en vivo",
        "Job registry stateless · cola en memoria · proceso único",
      ],
      endpoints: [
        {
          method: "POST",
          path: "/api/onboard",
          desc: "Crea un job de onboarding. Body: { merchant_input, lang, demo }.",
        },
        {
          method: "GET",
          path: "/api/stream/{job_id}",
          desc: "Suscríbete a SSE: snapshot, agent_started, agent_completed, log, done, error.",
        },
        {
          method: "GET",
          path: "/api/job/{job_id}",
          desc: "Obtén el snapshot final (campaign + summary) al terminar la ejecución.",
        },
        {
          method: "GET",
          path: "/healthz",
          desc: "Liveness probe.",
        },
        {
          method: "GET",
          path: "/static/Offerly.png",
          desc: "Servido por el mount StaticFiles del backend.",
        },
      ],
    },
  },
};
