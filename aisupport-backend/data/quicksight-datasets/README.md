# QuickSight Datasets

These CSV files are prepared for Amazon QuickSight imports. Each dataset has 200 rows and maps to one workspace role.

| Role | Dataset | Rows | Primary Dashboard Use |
|---|---|---:|---|
| Support Agent | support_agent_tickets_200.csv | 200 | Ticket workload, SLA risk, AI guidance, customer sentiment |
| Team Manager | team_manager_performance_200.csv | 200 | Agent performance, team backlog, SLA breaches, coaching flags |
| Business Executive | business_executive_insights_200.csv | 200 | Revenue risk, churn risk, product/region trends, executive priorities |
| System Admin | system_admin_activity_200.csv | 200 | User access, security events, API/config audit, MFA status |
| Customer Portal | customer_portal_activity_200.csv | 200 | Customer self-service, ticket tracking, chatbot usage, satisfaction |

Recommended QuickSight flow:

1. Upload each CSV as a separate dataset.
2. Let QuickSight auto-detect field types, then confirm date/time fields.
3. Build one analysis per role, or combine role datasets only when a common field is needed, such as ticket_id, region, product, or date.
