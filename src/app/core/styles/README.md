# UI Style Guide

## Color System

This project uses a standardized color system defined in `variables.scss`. The colors are organized into several categories for consistent application across the UI.

### Button Colors

For buttons throughout the application, we use only two main colors:

1. **Primary Color (`$primary-color`, `#2196F3`)**: Used for primary actions like submission, confirmation, or proceeding to the next step.

2. **Secondary Color (`$secondary-color`, `#757575`)**: Used for secondary actions like cancel, back, or alternative options.

In addition, we use these semantic colors for special cases:

- **Success (`$success-color`, `#4CAF50`)**: Used for successful actions, confirmations, or approvals.
- **Danger (`$danger-color`, `#F44336`)**: Used for destructive actions like delete or remove.

### How to Use Button Colors

When creating a new button in PrimeNG, use the `severity` attribute:

```html
<!-- Primary button (default) -->
<p-button label="Submit"></p-button>

<!-- Primary button (explicit) -->
<p-button label="Continue" severity="primary"></p-button>

<!-- Secondary button -->
<p-button label="Cancel" severity="secondary"></p-button>

<!-- Success button -->
<p-button label="Approve" severity="success"></p-button>

<!-- Danger button -->
<p-button label="Delete" severity="danger"></p-button>
```

### Outlined Variants

For less prominent actions, you can use the outlined variant:

```html
<p-button label="Cancel" severity="secondary" styleClass="p-button-outlined"></p-button>
```

## Implementation Notes

- All button styles are globally defined in `styles.scss` using variables from `variables.scss`
- The global styles will override any PrimeNG theme defaults
- Use only the defined colors for consistency across the application
