// La înregistrare, Strapi oferă o bifă de noutăți de la firma Strapi. Cine o bifează ajunge la
// chestionarul „What type of work do you do?”, iar emailul și prenumele lui pleacă la
// analytics.strapi.io, chiar și la „Skip”. Rolul și drepturile le stabilește cine invită, deci
// chestionarul nu folosește la nimic aici. Fără bifă, Strapi duce omul direct în panou.
// Ruta chestionarului nu poate fi schimbată din extensii, iar câmpul n-are atribut `name` în DOM:
// singurul reper stabil e linkul spre politica Strapi din eticheta bifei.

const CSS = `
form div:has(a[href="https://strapi.io/privacy"]):not(:has(input[type="password"])) { display: none; }
`;

export function hideVendorNewsletter() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
}
