# Adding Applications

*Screenshot: Applications tab in the Data Manager showing a list of applications — to be captured.*

## What applications are

An asset represents something your organisation owns or operates — for example, "CIAM Platform". That asset may be delivered by multiple software products running in parallel or in sequence, such as Okta, Azure AD B2C, and Keycloak. Applications let you record those individual products and track their lifecycles separately, all within the same asset.

## How to add an application

1. Go to **Data Manager** and select the **Applications** tab.
2. Click **Add Row**.
3. Enter the application name.
4. Select the parent asset from the **Asset** dropdown.

Changes are saved immediately — there is no separate save step.

## Key rules

- Each application belongs to exactly one asset.
- Once you have at least one application defined for an asset, an **Applications swimlane** appears beneath that asset's initiative row in the Visualiser.
- Applications are included in version snapshots, so your historical records capture the full application landscape at the time each snapshot was taken.

---

- Previous: [Critical Path](../04-dependencies/critical-path.md)
- Next: [Lifecycle Segments](lifecycle-segments.md)
