// ---------------------------------------------------------------------------
// Settings module — configuration data, option lists, and tab/column schemas
// ---------------------------------------------------------------------------

export type FieldType = "text" | "number" | "select" | "currency"

export interface ColumnDef {
  key: string
  label: string
  type: FieldType
  options?: readonly string[]
  /** Render the value as a colored status/role badge. */
  badge?: boolean
  /** Suffix shown after a number value, e.g. "%" or "days". */
  suffix?: string
  /** Hint text for the input in the add form. */
  placeholder?: string
}

export type SettingsRow = Record<string, string | number>

export interface TabConfig {
  id: string
  label: string
  /** Heading shown above the table/form. */
  title: string
  description: string
  /** Singular noun used in the "Add X" button. */
  entity: string
  columns: ColumnDef[]
  rows: SettingsRow[]
}

// --- Shared option lists ----------------------------------------------------

export const people = [
  "Dragan Stojchevski",
  "Aistė Navickas",
  "Greta Jonaitis",
  "Marius Kazlauskas",
  "Tomas Vasiliauskas",
  "Vaidas Petrauskas",
] as const

export const roles = ["Employee", "Manager", "Procurement", "Finance", "Legal", "Admin", "Super Admin"] as const

export const categories = [
  "Software",
  "Hardware",
  "Office Supplies",
  "Marketing",
  "Consulting",
  "Logistics",
  "Legal",
  "Finance",
  "Facilities",
  "Other",
] as const

export const requestTypes = ["Buy Product", "Buy Service", "Buy Software", "Add New Supplier"] as const

export const appliesTo = ["Request", "Supplier", "Competition", "Purchase Order", "Contract"] as const

export const fieldTypes = ["Text", "Number", "Date", "Dropdown", "Checkbox", "File Upload"] as const

export const currencies = ["EUR", "USD", "GBP", "PLN", "SEK"] as const

export const countries = ["Lithuania", "Latvia", "Estonia", "Poland", "Germany", "United Kingdom", "United States"] as const

export const timeZones = [
  "Europe/Vilnius (EET)",
  "Europe/Warsaw (CET)",
  "Europe/London (GMT)",
  "America/New_York (EST)",
] as const

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

export const statusOptions = ["Active", "Inactive"] as const
export const requiredOptions = ["Required", "Optional"] as const
export const yesNo = ["Yes", "No"] as const
export const departmentNames = ["IT", "Operations", "Marketing", "Finance", "Legal", "Facilities", "Procurement"] as const
export const scoringTypes = ["Numeric (1-10)", "Scale (1-5)", "Yes / No", "Percentage"] as const
export const answerTypes = ["Text", "Number", "Date", "Yes / No", "File Upload"] as const

// --- General configuration --------------------------------------------------

export interface GeneralConfig {
  companyName: string
  registrationNumber: string
  vatNumber: string
  country: string
  defaultCurrency: string
  timeZone: string
  fiscalYearStart: string
  ceo: string
  ceoApprovalThreshold: number
  highValueThreshold: number
  competitionRequiredThreshold: number
  contractRequiredThreshold: number
  minimumSupplierCount: number
}

export const generalConfig: GeneralConfig = {
  companyName: "ProcFly Demo Workspace",
  registrationNumber: "LT302998765",
  vatNumber: "LT100012345678",
  country: "Lithuania",
  defaultCurrency: "EUR",
  timeZone: "Europe/Vilnius (EET)",
  fiscalYearStart: "January",
  ceo: "Dragan Stojchevski",
  ceoApprovalThreshold: 100000,
  highValueThreshold: 25000,
  competitionRequiredThreshold: 10000,
  contractRequiredThreshold: 15000,
  minimumSupplierCount: 3,
}

// --- Tab schemas + seed rows ------------------------------------------------

export const settingsTabs: TabConfig[] = [
  {
    id: "members",
    label: "Members",
    title: "Members",
    description: "People with access to this workspace and their roles.",
    entity: "member",
    columns: [
      { key: "name", label: "User Name", type: "text", placeholder: "Jane Doe" },
      { key: "email", label: "Email", type: "text", placeholder: "jane@company.com" },
      { key: "role", label: "Role", type: "select", options: roles, badge: true },
      { key: "department", label: "Department", type: "select", options: departmentNames },
      { key: "manager", label: "Manager", type: "select", options: people },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
      { key: "permissions", label: "Permissions", type: "text", placeholder: "Approve, Create, View" },
    ],
    rows: [
      { name: "Dragan Stojchevski", email: "dragan@procfly.com", role: "Super Admin", department: "Procurement", manager: "—", status: "Active", permissions: "Full access" },
      { name: "Aistė Navickas", email: "aiste@procfly.com", role: "Procurement", department: "Procurement", manager: "Dragan Stojchevski", status: "Active", permissions: "Approve, Create, View" },
      { name: "Marius Kazlauskas", email: "marius@procfly.com", role: "Finance", department: "Finance", manager: "Dragan Stojchevski", status: "Active", permissions: "Approve, View" },
      { name: "Greta Jonaitis", email: "greta@procfly.com", role: "Manager", department: "Marketing", manager: "Dragan Stojchevski", status: "Active", permissions: "Create, View" },
      { name: "Tomas Vasiliauskas", email: "tomas@procfly.com", role: "Employee", department: "IT", manager: "Greta Jonaitis", status: "Inactive", permissions: "View" },
    ],
  },
  {
    id: "category-managers",
    label: "Category managers",
    title: "Category managers",
    description: "Owners responsible for each procurement category and their approval rights.",
    entity: "category manager",
    columns: [
      { key: "category", label: "Procurement Category", type: "select", options: categories },
      { key: "manager", label: "Category Manager", type: "select", options: people },
      { key: "backup", label: "Backup Manager", type: "select", options: people },
      { key: "approvalRole", label: "Approval Role", type: "select", options: roles, badge: true },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
    ],
    rows: [
      { category: "Software", manager: "Tomas Vasiliauskas", backup: "Aistė Navickas", approvalRole: "Procurement", status: "Active" },
      { category: "Hardware", manager: "Aistė Navickas", backup: "Tomas Vasiliauskas", approvalRole: "Procurement", status: "Active" },
      { category: "Marketing", manager: "Greta Jonaitis", backup: "Marius Kazlauskas", approvalRole: "Manager", status: "Active" },
      { category: "Consulting", manager: "Marius Kazlauskas", backup: "Vaidas Petrauskas", approvalRole: "Finance", status: "Inactive" },
    ],
  },
  {
    id: "departments",
    label: "Departments",
    title: "Departments",
    description: "Organizational departments, their managers, and default cost centers.",
    entity: "department",
    columns: [
      { key: "name", label: "Department Name", type: "text", placeholder: "Operations" },
      { key: "manager", label: "Department Manager", type: "select", options: people },
      { key: "budgetOwner", label: "Budget Owner", type: "select", options: people },
      { key: "costCenter", label: "Default Cost Center", type: "text", placeholder: "CC-100" },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
    ],
    rows: [
      { name: "IT", manager: "Tomas Vasiliauskas", budgetOwner: "Marius Kazlauskas", costCenter: "CC-101", status: "Active" },
      { name: "Operations", manager: "Vaidas Petrauskas", budgetOwner: "Marius Kazlauskas", costCenter: "CC-102", status: "Active" },
      { name: "Marketing", manager: "Greta Jonaitis", budgetOwner: "Greta Jonaitis", costCenter: "CC-103", status: "Active" },
      { name: "Finance", manager: "Marius Kazlauskas", budgetOwner: "Marius Kazlauskas", costCenter: "CC-104", status: "Active" },
    ],
  },
  {
    id: "cost-centers",
    label: "Cost centers",
    title: "Cost centers",
    description: "Accounting cost centers used to allocate spend across the organization.",
    entity: "cost center",
    columns: [
      { key: "code", label: "Cost Center Code", type: "text", placeholder: "CC-105" },
      { key: "name", label: "Cost Center Name", type: "text", placeholder: "Cloud Infrastructure" },
      { key: "department", label: "Department", type: "select", options: departmentNames },
      { key: "owner", label: "Owner", type: "select", options: people },
      { key: "budgetOwner", label: "Budget Owner", type: "select", options: people },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
    ],
    rows: [
      { code: "CC-101", name: "IT Equipment", department: "IT", owner: "Tomas Vasiliauskas", budgetOwner: "Marius Kazlauskas", status: "Active" },
      { code: "CC-102", name: "Logistics", department: "Operations", owner: "Vaidas Petrauskas", budgetOwner: "Marius Kazlauskas", status: "Active" },
      { code: "CC-103", name: "Brand & Campaigns", department: "Marketing", owner: "Greta Jonaitis", budgetOwner: "Greta Jonaitis", status: "Active" },
      { code: "CC-104", name: "Finance Operations", department: "Finance", owner: "Marius Kazlauskas", budgetOwner: "Marius Kazlauskas", status: "Inactive" },
    ],
  },
  {
    id: "budgets",
    label: "Budgets",
    title: "Budgets",
    description: "Allocated budgets per department and cost center, with utilization tracking.",
    entity: "budget",
    columns: [
      { key: "name", label: "Budget Name", type: "text", placeholder: "IT FY2026" },
      { key: "department", label: "Department", type: "select", options: departmentNames },
      { key: "costCenter", label: "Cost Center", type: "text", placeholder: "CC-101" },
      { key: "period", label: "Budget Period", type: "text", placeholder: "FY2026" },
      { key: "amount", label: "Budget Amount", type: "currency" },
      { key: "used", label: "Used Amount", type: "currency" },
      { key: "remaining", label: "Remaining Amount", type: "currency" },
      { key: "currency", label: "Currency", type: "select", options: currencies },
      { key: "owner", label: "Budget Owner", type: "select", options: people },
      { key: "warning", label: "Warning Threshold", type: "number", suffix: "%" },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
    ],
    rows: [
      { name: "IT FY2026", department: "IT", costCenter: "CC-101", period: "FY2026", amount: 250000, used: 162000, remaining: 88000, currency: "EUR", owner: "Marius Kazlauskas", warning: 80, status: "Active" },
      { name: "Marketing FY2026", department: "Marketing", costCenter: "CC-103", period: "FY2026", amount: 180000, used: 96500, remaining: 83500, currency: "EUR", owner: "Greta Jonaitis", warning: 85, status: "Active" },
      { name: "Operations FY2026", department: "Operations", costCenter: "CC-102", period: "FY2026", amount: 320000, used: 287000, remaining: 33000, currency: "EUR", owner: "Marius Kazlauskas", warning: 75, status: "Active" },
    ],
  },
  {
    id: "approval-steps",
    label: "Approval steps",
    title: "Approval steps",
    description: "Configurable approval workflow steps based on request type, category, and amount.",
    entity: "approval step",
    columns: [
      { key: "requestType", label: "Request Type", type: "select", options: requestTypes },
      { key: "category", label: "Procurement Category", type: "select", options: categories },
      { key: "threshold", label: "Amount Threshold", type: "currency" },
      { key: "department", label: "Department", type: "select", options: departmentNames },
      { key: "costCenter", label: "Cost Center", type: "text", placeholder: "Any" },
      { key: "stepName", label: "Approval Step Name", type: "text", placeholder: "Manager approval" },
      { key: "approverRole", label: "Approver Role", type: "select", options: roles, badge: true },
      { key: "approver", label: "Approver User / Group", type: "select", options: people },
      { key: "order", label: "Step Order", type: "number" },
      { key: "required", label: "Required / Optional", type: "select", options: requiredOptions, badge: true },
      { key: "sla", label: "SLA / Due Days", type: "number", suffix: "days" },
      { key: "backup", label: "Backup Approver", type: "select", options: people },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
    ],
    rows: [
      { requestType: "Buy Product", category: "Hardware", threshold: 5000, department: "IT", costCenter: "CC-101", stepName: "Manager approval", approverRole: "Manager", approver: "Tomas Vasiliauskas", order: 1, required: "Required", sla: 2, backup: "Aistė Navickas", status: "Active" },
      { requestType: "Buy Software", category: "Software", threshold: 10000, department: "IT", costCenter: "Any", stepName: "Procurement review", approverRole: "Procurement", approver: "Aistė Navickas", order: 2, required: "Required", sla: 3, backup: "Tomas Vasiliauskas", status: "Active" },
      { requestType: "Buy Service", category: "Consulting", threshold: 25000, department: "Finance", costCenter: "Any", stepName: "Finance sign-off", approverRole: "Finance", approver: "Marius Kazlauskas", order: 3, required: "Required", sla: 4, backup: "Vaidas Petrauskas", status: "Active" },
      { requestType: "Add New Supplier", category: "Other", threshold: 0, department: "Procurement", costCenter: "Any", stepName: "CEO approval", approverRole: "Super Admin", approver: "Dragan Stojchevski", order: 4, required: "Optional", sla: 5, backup: "—", status: "Inactive" },
    ],
  },
  {
    id: "evaluation-criteria",
    label: "Evaluation criteria",
    title: "Evaluation criteria",
    description: "Weighted criteria used to score and compare supplier proposals.",
    entity: "criterion",
    columns: [
      { key: "category", label: "Category", type: "select", options: categories },
      { key: "name", label: "Criteria Name", type: "text", placeholder: "Price" },
      { key: "weight", label: "Weight", type: "number", suffix: "%" },
      { key: "scoring", label: "Scoring Type", type: "select", options: scoringTypes },
      { key: "required", label: "Required / Optional", type: "select", options: requiredOptions, badge: true },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
    ],
    rows: [
      { category: "Software", name: "Price", weight: 40, scoring: "Numeric (1-10)", required: "Required", status: "Active" },
      { category: "Software", name: "Technical Fit", weight: 25, scoring: "Scale (1-5)", required: "Required", status: "Active" },
      { category: "Hardware", name: "Delivery Time", weight: 20, scoring: "Numeric (1-10)", required: "Required", status: "Active" },
      { category: "Consulting", name: "Supplier Rating", weight: 15, scoring: "Scale (1-5)", required: "Optional", status: "Active" },
    ],
  },
  {
    id: "competition-questions",
    label: "Competition questions",
    title: "Competition questions",
    description: "Standard questions asked to suppliers during competitions.",
    entity: "question",
    columns: [
      { key: "question", label: "Question", type: "text", placeholder: "What is your delivery time?" },
      { key: "category", label: "Category", type: "select", options: categories },
      { key: "answerType", label: "Answer Type", type: "select", options: answerTypes },
      { key: "required", label: "Required / Optional", type: "select", options: requiredOptions, badge: true },
      { key: "evaluation", label: "Used For Evaluation", type: "select", options: yesNo, badge: true },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
    ],
    rows: [
      { question: "What is your standard delivery time?", category: "Hardware", answerType: "Number", required: "Required", evaluation: "Yes", status: "Active" },
      { question: "What warranty period do you offer?", category: "Hardware", answerType: "Text", required: "Required", evaluation: "Yes", status: "Active" },
      { question: "What are your payment terms?", category: "Software", answerType: "Text", required: "Required", evaluation: "No", status: "Active" },
      { question: "Describe your implementation timeline.", category: "Consulting", answerType: "Date", required: "Optional", evaluation: "Yes", status: "Active" },
    ],
  },
  {
    id: "custom-fields",
    label: "Custom fields",
    title: "Custom fields",
    description: "Additional fields attached to records across the procurement lifecycle.",
    entity: "custom field",
    columns: [
      { key: "name", label: "Field Name", type: "text", placeholder: "Project Code" },
      { key: "fieldType", label: "Field Type", type: "select", options: fieldTypes },
      { key: "appliesTo", label: "Applies To", type: "select", options: appliesTo, badge: true },
      { key: "requestType", label: "Request Type", type: "select", options: requestTypes },
      { key: "category", label: "Category", type: "select", options: categories },
      { key: "required", label: "Required / Optional", type: "select", options: requiredOptions, badge: true },
      { key: "options", label: "Options", type: "text", placeholder: "A, B, C" },
      { key: "order", label: "Display Order", type: "number" },
      { key: "status", label: "Status", type: "select", options: statusOptions, badge: true },
    ],
    rows: [
      { name: "Project Code", fieldType: "Text", appliesTo: "Request", requestType: "Buy Product", category: "Hardware", required: "Required", options: "—", order: 1, status: "Active" },
      { name: "Risk Level", fieldType: "Dropdown", appliesTo: "Supplier", requestType: "Add New Supplier", category: "Other", required: "Optional", options: "Low, Medium, High", order: 2, status: "Active" },
      { name: "Contract Annex", fieldType: "File Upload", appliesTo: "Contract", requestType: "Buy Service", category: "Legal", required: "Optional", options: "—", order: 3, status: "Active" },
      { name: "Urgent", fieldType: "Checkbox", appliesTo: "Request", requestType: "Buy Software", category: "Software", required: "Optional", options: "—", order: 4, status: "Inactive" },
    ],
  },
]

/** Badge color classes keyed by value for status/role/required columns. */
export function settingsBadgeClass(value: string): string {
  switch (value) {
    case "Active":
    case "Required":
    case "Yes":
      return "bg-primary/10 text-primary"
    case "Inactive":
    case "No":
      return "bg-muted text-muted-foreground"
    case "Optional":
      return "bg-amber-100 text-amber-700"
    case "Super Admin":
    case "Admin":
      return "bg-rose-100 text-rose-700"
    case "Finance":
    case "Legal":
      return "bg-blue-100 text-blue-700"
    case "Procurement":
    case "Manager":
      return "bg-emerald-100 text-emerald-700"
    default:
      return "bg-muted text-muted-foreground"
  }
}
