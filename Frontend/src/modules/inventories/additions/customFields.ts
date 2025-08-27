export const customFields = [
  {
    id: "inventory-serial-number",
    name: "Serial Number",
    type: "text",
    showintable: true,
    sortorder: 1,
    validationrules: { required: true, maxLength: 50 },
    options: null,
    placeholder: "E.g. 123456789"
  },
  {
    id: "inventory-brand",
    name: "Brand",
    type: "dropdown",
    showintable: true,
    sortorder: 2,
    validationrules: { required: true },
    options: ["Dell", "HP", "Lenovo", "Apple", "ASUS"],
    placeholder: "Select a brand"
  },
  {
    id: "inventory-model",
    name: "Model",
    type: "text",
    showintable: true,
    sortorder: 3,
    validationrules: { required: true, maxLength: 100 },
    options: null,
    placeholder: "E.g. MacBook Pro"
  },
  {
    id: "inventory-price",
    name: "Price",
    type: "number",
    showintable: true,
    sortorder: 4,
    validationrules: { min: 0, max: 50000 },
    options: null,
    placeholder: "E.g. 1200"
  },
  {
    id: "inventory-purchase-date",
    name: "Purchase Date",
    type: "date",
    showintable: true,
    sortorder: 5,
    validationrules: { required: true },
    options: null,
    placeholder: ""
  },
  {
    id: "inventory-under-warranty",
    name: "Under Warranty",
    type: "checkbox",
    showintable: true,
    sortorder: 6,
    validationrules: null,
    options: null,
    placeholder: ""
  },
  {
    id: "inventory-condition",
    name: "Condition",
    type: "dropdown",
    showintable: true,
    sortorder: 7,
    validationrules: { required: true },
    options: ["Excellent", "Good", "Fair", "Poor"],
    placeholder: "Select condition"
  },
  {
    id: "inventory-location",
    name: "Location",
    type: "text",
    showintable: false,
    sortorder: 8,
    validationrules: { maxLength: 200 },
    options: null,
    placeholder: "E.g. Office 2nd Floor"
  },
  {
    id: "inventory-notes",
    name: "Notes",
    type: "text",
    showintable: false,
    sortorder: 9,
    validationrules: { maxLength: 500 },
    options: null,
    placeholder: "Additional notes"
  }
];