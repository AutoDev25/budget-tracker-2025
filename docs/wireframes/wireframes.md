# Budget Tracker 2025 - Command-Line Style Wireframes

## Main Dashboard Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ budget-tracker:~$ ./dashboard --month=2025-09                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ > BUDGET DASHBOARD - September 2025                                         │
│                                                                             │
│ ┌─ QUICK STATS ──────────────────────────┐ ┌─ RECENT EXPENSES ─────────────┐ │
│ │ Total Spent: $2,847.32                 │ │ 09/01 | Food      | $45.67    │ │
│ │ Budget Remaining: $1,152.68            │ │       | @You      | Groceries │ │
│ │ Daily Average: $94.91                  │ │                               │ │
│ │                                        │ │ 08/31 | Transport | $12.50    │ │
│ │ [████████████░░░░] 71% used            │ │       | @Partner  | Bus fare  │ │
│ └────────────────────────────────────────┘ │                               │ │
│                                            │ 08/30 | Utilities | $89.23    │ │
│ ┌─ USER BREAKDOWN ───────────────────────┐ │       | @You      | Electric  │ │
│ │ You:        $1,623.45 (57%)            │ │                               │ │
│ │ Partner:    $1,223.87 (43%)            │ │ [show all] [add expense]      │ │
│ │                                        │ └───────────────────────────────┘ │
│ │ [view details] [settle up]             │                                   │
│ └────────────────────────────────────────┘                                   │
│                                                                             │
│ ┌─ CATEGORY BREAKDOWN ───────────────────────────────────────────────────────┐ │
│ │ Food         ████████████░░ $847.32 (30%)                                 │ │
│ │ Transport    ██████░░░░░░░░ $423.45 (15%)                                 │ │
│ │ Utilities    █████░░░░░░░░░ $356.78 (12%)                                 │ │
│ │ Entertainment████░░░░░░░░░░ $289.34 (10%)                                 │ │
│ │ Other        ███████░░░░░░░ $530.43 (19%)                                 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ budget-tracker:~$ [add] [import] [export] [users] [reports] [settings]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Add Expense Form Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ budget-tracker:~$ ./add-expense                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ > ADD NEW EXPENSE                                                           │
│                                                                             │
│ ┌─ EXPENSE DETAILS ───────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ Amount: $ [_____________]                                               │ │
│ │                                                                         │ │
│ │ Category: [Food        ▼] ┌─ Available Categories ─┐                    │ │
│ │                           │ Food                    │                    │ │
│ │ Date: [2025-09-01____]    │ Transportation          │                    │ │
│ │                           │ Utilities               │                    │ │
│ │ Description:              │ Entertainment           │                    │ │
│ │ [________________________]│ Shopping                │                    │ │
│ │ [________________________]│ Healthcare              │                    │ │
│ │                           │ Education               │                    │ │
│ │ Assigned to:              │ Travel                  │                    │ │
│ │ [@You            ▼]       │ Insurance               │                    │ │
│ │                           │ Other                   │                    │ │
│ │                           └─────────────────────────┘                    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ PREVIEW ──────────────────────────────────────────────────────────────┐ │
│ │ $45.67 | Food | 2025-09-01 | @You | Grocery shopping                   │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ budget-tracker:~$ [save] [cancel] [save & add another]                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## CSV Import/Export Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ budget-tracker:~$ ./import-export                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ > DATA IMPORT/EXPORT                                                        │
│                                                                             │
│ ┌─ IMPORT CSV ────────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ Drag CSV file here or [choose file]                                     │ │
│ │ ┌─ OR ─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Expected format:                                                     │ │ │
│ │ │ date,amount,category,description,user                                │ │ │
│ │ │ 2025-09-01,45.67,Food,Groceries,You                                 │ │ │
│ │ │ 2025-08-31,12.50,Transport,Bus fare,Partner                         │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ Status: [ready] [processing] [error] [success]                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ EXPORT OPTIONS ───────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ Export Range:                                                           │ │
│ │ ○ Current Month (September 2025)                                        │ │
│ │ ○ Last 3 Months                                                         │ │
│ │ ○ All Time                                                              │ │
│ │ ○ Custom Range: [from] ──── [to]                                        │ │
│ │                                                                         │ │
│ │ Include:                                                                │ │
│ │ ☑ All expense details                                                   │ │
│ │ ☑ User assignments                                                      │ │
│ │ ☑ Category breakdown                                                    │ │
│ │ ☐ Monthly summaries                                                     │ │
│ │                                                                         │ │
│ │ [download csv] [preview data]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ budget-tracker:~$ [back to dashboard]                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## User Management Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ budget-tracker:~$ ./users --list                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ > USER MANAGEMENT                                                           │
│                                                                             │
│ ┌─ CURRENT USERS ────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ ID | Name      | Color   | Expenses | Total Spent | Actions            │ │
│ │────┼───────────┼─────────┼──────────┼─────────────┼────────────────────│ │
│ │ 01 │ You       │ ●#667eea│    47    │  $1,623.45  │ [edit] [delete]    │ │
│ │ 02 │ Partner   │ ●#764ba2│    38    │  $1,223.87  │ [edit] [delete]    │ │
│ │ 03 │ Roommate  │ ●#28a745│    12    │    $456.78  │ [edit] [delete]    │ │
│ │                                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ ADD NEW USER ─────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ Name: [_________________]                                               │ │
│ │                                                                         │ │
│ │ Color: [●] ●#667eea ●#764ba2 ●#28a745 ●#ffc107 ●#dc3545 ●#f093fb       │ │
│ │                                                                         │ │
│ │ [add user] [cancel]                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ RESPONSIBILITY SUMMARY ───────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ September 2025 Breakdown:                                               │ │
│ │                                                                         │ │
│ │ You        ████████████████████ $1,623.45 (57%)                        │ │
│ │ Partner    ██████████████░░░░░░ $1,223.87 (43%)                        │ │
│ │ Roommate   ████░░░░░░░░░░░░░░░░   $456.78 (16%)                        │ │
│ │                                                                         │ │
│ │ Total:     $3,304.10                                                    │ │
│ │ Average:   $1,101.37 per person                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ budget-tracker:~$ [back] [export user report]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Monthly View Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ budget-tracker:~$ ./expenses --month=2025-09                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ > SEPTEMBER 2025 EXPENSES                                                   │
│                                                                             │
│ ┌─ NAVIGATION ────────────────────────────────────────────────────────────┐ │
│ │ [◄ Aug] [September 2025] [Oct ►]    Filter: [All Users ▼] [All Cats ▼] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ EXPENSE LIST ─────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ DATE     │ CATEGORY     │ DESCRIPTION      │ USER     │ AMOUNT    │ ⚙   │ │
│ │──────────┼──────────────┼──────────────────┼──────────┼───────────┼─────│ │
│ │ 09/01    │ ●Food        │ Grocery shopping │ @You     │ $45.67    │[E][D│ │
│ │ 09/01    │ ●Transport   │ Gas fill-up      │ @You     │ $52.30    │[E][D│ │
│ │ 08/31    │ ●Utilities   │ Electric bill    │ @Partner │ $89.45    │[E][D│ │
│ │ 08/30    │ ●Food        │ Restaurant       │ @You     │ $78.90    │[E][D│ │
│ │ 08/30    │ ●Entertainment│ Movie tickets   │ @Partner │ $24.00    │[E][D│ │
│ │                                                                         │ │
│ │ [load more] [add expense] [bulk actions]                                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ MONTH SUMMARY ────────────────────────────────────────────────────────┐ │
│ │ Total: $2,847.32  |  Transactions: 47  |  Avg: $60.58 per expense      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ budget-tracker:~$ [dashboard] [import] [export] [users] [help]              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Import Preview Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ budget-tracker:~$ ./import --file=expenses.csv --preview                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ > CSV IMPORT PREVIEW                                                        │
│                                                                             │
│ ┌─ FILE INFO ────────────────────────────────────────────────────────────┐ │
│ │ File: expenses.csv                                                      │ │
│ │ Size: 2.3 KB                                                            │ │
│ │ Rows: 89 expenses detected                                              │ │
│ │ Date Range: 2025-01-15 to 2025-08-30                                   │ │
│ │ Status: ✓ Valid format                                                  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ PREVIEW DATA ─────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ ROW │ DATE       │ AMOUNT │ CATEGORY │ DESCRIPTION    │ USER    │ STATUS │ │
│ │─────┼────────────┼────────┼──────────┼────────────────┼─────────┼────────│ │
│ │ 001 │ 2025-08-30 │ $45.67 │ Food     │ Groceries      │ You     │ ✓ OK   │ │
│ │ 002 │ 2025-08-29 │ $12.50 │ Transport│ Bus fare       │ Partner │ ✓ OK   │ │
│ │ 003 │ 2025-08-28 │ $89.23 │ Utilities│ Electric       │ You     │ ✓ OK   │ │
│ │ 004 │ 2025-08-27 │ -5.00  │ Food     │ Invalid amount │ Unknown │ ✗ ERR  │ │
│ │ 005 │ 2025-08-26 │ $23.45 │ Shopping │ Amazon order   │ You     │ ✓ OK   │ │
│ │                                                                         │ │
│ │ ... showing 5 of 89 rows                                                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ IMPORT SUMMARY ───────────────────────────────────────────────────────┐ │
│ │ Valid rows: 86                                                          │ │
│ │ Error rows: 3 (will be skipped)                                         │ │
│ │ New users detected: 1 (will be created)                                 │ │
│ │ Date conflicts: 0                                                       │ │
│ │                                                                         │ │
│ │ ⚠ 3 rows have errors - view details or proceed without them            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ budget-tracker:~$ [import now] [view errors] [cancel] [download template]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Expense Detail View Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ budget-tracker:~$ ./expense --id=1a2b3c --view                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ > EXPENSE DETAILS                                                           │
│                                                                             │
│ ┌─ EXPENSE #1a2b3c ──────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ Amount:      $45.67                                                     │ │
│ │ Category:    ●Food                                                      │ │
│ │ Date:        September 1, 2025                                          │ │
│ │ Description: Grocery shopping at Whole Foods                            │ │
│ │ Assigned to: @You                                                       │ │
│ │ Created:     2025-09-01 14:23:45                                        │ │
│ │ Modified:    2025-09-01 14:23:45                                        │ │
│ │                                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ ACTIONS ──────────────────────────────────────────────────────────────┐ │
│ │ [edit expense] [delete expense] [duplicate] [reassign user]             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ RELATED EXPENSES ─────────────────────────────────────────────────────┐ │
│ │ Other Food expenses this month:                                         │ │
│ │                                                                         │ │
│ │ 09/03 | $23.45 | Coffee shop      | @You                               │ │
│ │ 09/05 | $67.89 | Restaurant dinner| @Partner                            │ │
│ │ 09/07 | $34.56 | Lunch takeout    | @You                               │ │
│ │                                                                         │ │
│ │ Category total: $171.57                                                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ budget-tracker:~$ [back] [edit] [delete] [dashboard]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Reports/Analytics Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ budget-tracker:~$ ./reports --generate --type=monthly                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ > MONTHLY REPORTS - September 2025                                          │
│                                                                             │
│ ┌─ SPENDING TRENDS ──────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │     $3000 ┤                                                             │ │
│ │           │     ●                                                       │ │
│ │     $2500 ┤   ╱   ╲                                                     │ │
│ │           │ ╱       ╲                                                   │ │
│ │     $2000 ┤╱         ●                                                  │ │
│ │           │            ╲                                                │ │
│ │     $1500 ┤              ╲___●                                          │ │
│ │           │                                                             │ │
│ │     $1000 ┤                                                             │ │
│ │           └─────┬─────┬─────┬─────┬─────┬─────                          │ │
│ │               Jan   Mar   May   Jul   Sep   Nov                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ TOP CATEGORIES ───────────────────────────────────────────────────────┐ │
│ │ 1. Food         ████████████████████ $847.32 (30%)                     │ │
│ │ 2. Transport    ████████████░░░░░░░░ $423.45 (15%)                     │ │
│ │ 3. Utilities    ██████████░░░░░░░░░░ $356.78 (13%)                     │ │
│ │ 4. Shopping     ████████░░░░░░░░░░░░ $298.67 (10%)                     │ │
│ │ 5. Other        ██████░░░░░░░░░░░░░░ $921.20 (32%)                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ USER COMPARISON ──────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │ @You:     $1,623.45  ████████████████████████████░░ (57%)              │ │
│ │ @Partner: $1,223.87  █████████████████████░░░░░░░░░ (43%)              │ │
│ │                                                                         │ │
│ │ Difference: $399.58 (You spent 32% more)                               │ │
│ │ Shared expenses: $456.78                                                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ budget-tracker:~$ [export report] [previous month] [dashboard] [settings]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Elements for CMD-Line Aesthetic:
- **Terminal-style borders** using ASCII characters (┌─┐│└┘)
- **Monospace-friendly layouts** with proper alignment
- **Command prompt styling** at top and bottom
- **Status indicators** using symbols (●, ✓, ✗, ⚠)
- **Progress bars** using block characters (█░)
- **Hierarchical information** with clear visual separation
- **Action buttons** styled as command options
- **Data tables** with clean ASCII borders and alignment

These wireframes capture the terminal aesthetic while maintaining usability for your budget tracking features including CSV import/export and user responsibility assignment!