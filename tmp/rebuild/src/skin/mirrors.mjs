/**
 * NAVIS APEXIALIS SKIN — impmal overrides.
 *
 * impmal's themed CSS is unlayered, like ours, so to override a rule we have to
 * match its specificity and load after it. Its selector lists run up to 24
 * selectors per rule, several carry two ids, and they repeat three times over
 * (#chat-popout, #interface, #interface #sidebar). Copying those by hand is how
 * a skin quietly loses: one dropped selector and that variant stays green.
 *
 * So these entries name a rule by its TAIL — any one selector from impmal's
 * list, minus the `body.impmal-theme ` prefix — and tools/build-skin.mjs looks
 * the rule up in impmal.css and emits our declarations under impmal's exact
 * selector list, with the prefix swapped for `body.navis-skin`. Same
 * specificity, later in the cascade, so ours wins; and because the prefix is
 * ours, it keeps working when a player has impmal's own theme switched off.
 *
 * The build also audits coverage: every impmal themed rule that paints with a
 * literal colour, texture, gradient, glow or radius must appear either in
 * `mirrors` or in `ignored`, with a reason. A new such rule in a future impmal
 * release fails the build until someone decides what to do with it.
 */

const plate = "var(--navis-plate)";
const plateSm = "var(--navis-plate-sm)";

/** A recessed field with a rust edge: the skin's one shape for "press this". */
const pressable = {
  "background-color": "var(--navis-field)",
  "color": "var(--navis-accent-lit)",
  "border": "1px solid var(--navis-line)",
  "border-left": "3px solid var(--navis-accent)",
  "border-radius": "0",
  "box-shadow": "none",
  "transition": "background-color var(--navis-transition), color var(--navis-transition)"
};

/** A plain field button: quieter than pressable, for secondary actions. */
const fieldButton = {
  "background-color": "var(--navis-field)",
  "color": "var(--navis-ink)",
  "border": "1px solid var(--navis-line)",
  "border-radius": "0",
  "box-shadow": "none",
  "transition": "background-color var(--navis-transition), border-color var(--navis-transition), color var(--navis-transition)"
};

/**
 * Foundry's button variables, as impmal reassigns them. impmal points the hover
 * background at --impmal-lightgreen; with that token now rust-bright, every
 * button in the interface would flood solid rust on hover with light text on
 * it — about 2.6:1, unreadable, and a solid fill the skin never uses.
 */
const buttonVars = {
  "--button-text-color": "var(--navis-ink)",
  "--button-focus-outline-color": "var(--navis-accent)",
  "--button-hover-background-color": "var(--navis-raised)",
  "--button-hover-border-color": "var(--navis-accent)",
  "--button-hover-text-color": "var(--navis-accent-lit)"
};

/** Selected / chosen / active: a lifted plate with a rust edge, never a solid fill. */
const selected = {
  "background": "var(--navis-raised)",
  "color": "var(--navis-accent-lit)",
  "box-shadow": "inset 3px 0 0 var(--navis-accent)"
};

/** impmal's corner brackets (four conic gradients) answered with a cut plate. */
const bracketsToPlate = (clip) => ({
  "background": "var(--navis-raised)",
  "border": "1px solid var(--navis-line)",
  "border-left": "3px solid var(--navis-brass-dim)",
  "clip-path": clip
});

/** Content-link icons are tinted with a CSS filter. This one lands near brass. */
const brassFilter = "invert(58%) sepia(38%) saturate(640%) hue-rotate(356deg) brightness(92%)";

const brokenLink = { "color": "var(--navis-danger)", "background": "rgba(210, 102, 88, 0.08)" };
const brokenIcon = { "color": "var(--navis-danger)" };

const tableHeaderPlate = {
  "color": "var(--navis-brass)",
  "background-image": "none",
  "background-color": "var(--navis-raised)"
};

export const mirrors = [
  /* ── Every window ─────────────────────────────────────────────────────── */
  {
    tail: ".application:not(.journal-sheet)",
    why: "window text palette",
    decls: {
      "--color-text-primary": "var(--navis-ink)",
      "--color-text-secondary": "var(--navis-ink-muted)",
      "--color-text-subtle": "var(--navis-ink-faint)",
      "--color-form-label": "var(--navis-brass)",
      "--color-form-label-hover": "var(--navis-ink)",
      "--color-form-hint": "var(--navis-ink-faint)",
      "--color-form-hint-hover": "var(--navis-ink-muted)"
    }
  },
  {
    tail: ".application:not(.journal-sheet) .window-header",
    why: "green gradient header with a glow → flat plate, brass title",
    decls: {
      "background": "var(--navis-surface)",
      "box-shadow": "none",
      "border-bottom": "1px solid var(--navis-line)",
      "color": "var(--navis-brass)"
    }
  },
  {
    tail: ".application:not(.journal-sheet) .window-content",
    why: "diagonal teal gradient → flat near-black, so panels inside carry the depth",
    decls: { "background": "var(--navis-window)", "color": "var(--navis-ink)" }
  },
  { tail: ".application:not(.journal-sheet) textarea", why: "text colour", decls: { "color": "var(--navis-ink)" } },
  {
    tail: ".application:not(.journal-sheet) input:not([type=checkbox], [type=range], [type=radio])",
    why: "text colour",
    decls: { "color": "var(--navis-ink)" }
  },
  { tail: ".application:not(.journal-sheet) .form-group button", why: "rounded white-text button", decls: fieldButton },
  { tail: ".application:not(.journal-sheet) button", why: "hover floods rust-bright once the token is remapped", decls: buttonVars },
  { tail: ".application:not(.journal-sheet).roll-table-sheet button", why: "hover floods rust-bright once the token is remapped", decls: buttonVars },
  {
    tail: ".application:not(.journal-sheet).roll-table-sheet",
    why: "the highlighted table row would fill solid rust-bright",
    decls: { "--table-row-color-highlight": "var(--navis-raised)" }
  },
  {
    tail: ".application:not(.journal-sheet) input[type=checkbox]",
    why: "unchecked box would sit on rust-brown; it is a field",
    decls: { "--checkbox-background-color": "var(--navis-field)" }
  },
  {
    tail: ".application:not(.journal-sheet) input[type=range]",
    why: "rust-brown track; the track is structure, the thumb is what you press",
    decls: {
      "--range-track-color": "var(--navis-line)",
      "--range-thumb-background-color": "var(--navis-accent)",
      "--range-thumb-border-color": "var(--navis-accent-lit)"
    }
  },
  {
    tail: ".application:not(.journal-sheet) nav.sheet-tabs a[data-tab].active",
    why: "the active tab, with impmal's theme on: the same lifted plate as with it off",
    decls: {
      "background": "var(--navis-raised)",
      "color": "var(--navis-accent-lit)",
      "box-shadow": "inset 0 -2px 0 var(--navis-accent)"
    }
  },
  {
    tail: ".application:not(.journal-sheet) nav.sheet-tabs > a[data-tab]",
    why: "tabs are captions, so they take the stencil rather than the display face",
    decls: { "font-family": "var(--navis-font-stencil)", "text-transform": "uppercase", "letter-spacing": "1px" }
  },
  {
    tail: ".application:not(.journal-sheet).advancement .advancement-list .skill:nth-child(even)",
    why: "teal zebra stripe",
    decls: { "background-color": "rgba(255, 255, 255, 0.025)" }
  },
  {
    tail: ".application:not(.journal-sheet).roll-dialog-v2 .dialog-modifiers .modifier.active",
    why: "black text on a green chip → lifted plate",
    decls: { ...selected, "--modifier-bg": "var(--navis-raised)" }
  },
  { tail: ".application:not(.journal-sheet).item-dialog .selected", why: "solid green fill", decls: selected },
  { tail: ".application:not(.journal-sheet).choice-decision .choice.chosen", why: "solid green fill", decls: selected },

  /* ── warhammer-lib lists and buttons, as impmal themes them ──────────── */
  { tail: ".warhammer.application form span.units", why: "grey literal", decls: { "color": "var(--navis-ink-muted)" } },
  { tail: ".warhammer.application .units", why: "grey literal", decls: { "color": "var(--navis-ink-muted)" } },
  { tail: ".warhammer.application form .slim .form-fields > label", why: "grey literal", decls: { "color": "var(--navis-ink)" } },
  { tail: ".warhammer.application", why: "green scrollbar → brass", decls: { "--color-scrollbar": "var(--navis-brass-dim)" } },
  { tail: ".warhammer.application button", why: "hover floods rust-bright once the token is remapped", decls: buttonVars },
  { tail: ".warhammer.application .window-content button", why: "rounded white-text button", decls: fieldButton },
  {
    tail: ".warhammer.application .window-content button:hover",
    why: "hover state for the button above",
    decls: { "background-color": "var(--navis-raised)", "border-color": "var(--navis-accent)", "color": "var(--navis-accent-lit)" }
  },
  { tail: ".warhammer.application div.sheet-list", why: "corner brackets → cut plate", decls: bracketsToPlate(plate) },
  {
    tail: ".warhammer.application div.sheet-list .list-row:not(.list-header, .no-scan) .row-content:hover > * select",
    why: "translucent grey border",
    decls: { "border-color": "var(--navis-line)" }
  },
  {
    tail: ".warhammer.application div.sheet-list .row-content input:not([type=checkbox])",
    why: "translucent field, rounded",
    decls: { "background": "var(--navis-field)", "border-radius": "0" }
  },

  /* ── Actor sheets ─────────────────────────────────────────────────────── */
  {
    tail: ".application.impmal.actor",
    why: "sheet text palette",
    decls: {
      "--color-text-primary": "var(--navis-ink)",
      "--color-text-secondary": "var(--navis-ink-muted)",
      "--dropshadow": "var(--navis-line)",
      "--drop": "var(--navis-brass-dim)"
    }
  },
  {
    tail: ".application.impmal.actor .tab[data-tab=powers].active",
    why: "warp charge states: green and orange → alert and danger",
    decls: { "--state1": "var(--navis-alert)", "--state2": "var(--navis-danger)" }
  },
  {
    tail: ".application.impmal.actor .header-details .details-row .detail-group .input-group > *",
    why: "grey literal",
    decls: { "color": "var(--navis-ink)", "border-radius": "0" }
  },
  {
    tail: ".application.impmal.actor .defending-against .gradient-border",
    why: "green gradient edge; defending is a live condition, so it takes alert",
    decls: { "border-image-source": "linear-gradient(36deg, transparent 0%, var(--navis-alert) 50%, transparent 100%)" }
  },
  {
    tail: ".application.impmal.actor .hit-locations .armour-damage",
    why: "darkred literal",
    decls: { "background": "var(--navis-danger)" }
  },
  {
    tail: ".application.impmal.actor .bar-section .bar-container .threshold",
    why: "light grey threshold marker",
    decls: { "border-top-color": "var(--navis-ink-muted)" }
  },
  {
    tail: ".application.impmal.actor .tab[data-tab=powers].active .bar-container .threshold",
    why: "light grey threshold marker",
    decls: { "border-top-color": "var(--navis-ink-muted)" }
  },
  {
    tail: ".application.impmal.actor .tab[data-tab=equipment].active .bar-container .state1",
    why: "overburdened: solid green → alert with the spent-load hatch",
    decls: { "background-color": "var(--navis-alert)", "background-image": "var(--navis-hatch)" }
  },
  {
    tail: ".application.impmal.actor .tab[data-tab=equipment].active .bar-container .state2",
    why: "restrained: solid orange → danger with the spent-load hatch",
    decls: { "background-color": "var(--navis-danger)", "background-image": "var(--navis-hatch)" }
  },

  /* ── All impmal sheets ────────────────────────────────────────────────── */
  {
    tail: ".application.impmal.sheet",
    why: "sheet text palette; slot backgrounds would otherwise fill solid rust-bright",
    decls: {
      "--color-text-primary": "var(--navis-ink)",
      "--color-scrollbar": "var(--navis-brass-dim)",
      "--slot-border": "var(--navis-line)",
      "--slot-bg": "var(--navis-field)",
      "--slot": "var(--navis-line)"
    }
  },
  {
    tail: ".application.impmal.sheet hr",
    why: "green gradient rule → brass",
    decls: { "background-image": "linear-gradient(90deg, transparent 0%, var(--navis-brass-dim) 50%, transparent 100%)" }
  },
  {
    tail: ".application.impmal.sheet .input-list .fields > * input:not([type=checkbox], [type=range], [type=radio])",
    why: "rounded field",
    decls: { "border-radius": "0" }
  },
  {
    tail: ".application.impmal.sheet .details-row.name",
    why: "brass cartouche texture → flat plate with a brass edge",
    decls: {
      "background-image": "none",
      "background-color": "var(--navis-raised)",
      "border-left": "3px solid var(--navis-brass)",
      "clip-path": plateSm
    }
  },
  {
    tail: ".application.impmal.sheet .details-row.name input",
    why: "name was dark teal on the texture; on a dark plate it has to become brass or it vanishes",
    decls: {
      "box-shadow": "none",
      "color": "var(--navis-brass)",
      "text-transform": "uppercase",
      "letter-spacing": "var(--navis-track-caption)"
    }
  },
  { tail: ".application.impmal.sheet .attribute-box", why: "corner brackets → cut plate", decls: bracketsToPlate(plateSm) },
  {
    tail: ".application.impmal.sheet .attribute-box .field input",
    why: "translucent rounded field → recessed field",
    decls: { "background": "var(--navis-field)", "border-radius": "0" }
  },
  {
    tail: ".application.impmal.sheet .attribute-box:hover",
    why: "teal hover wash; the box is not pressable, so only its edge responds",
    decls: { "background-color": "var(--navis-raised)", "border-left-color": "var(--navis-brass)" }
  },
  {
    tail: ".application.impmal.sheet .tab[data-tab=effects]",
    why: "condition pips count how hard a condition bites — a live condition, so alert, not the affordance rust",
    decls: { "--pip": "var(--navis-alert)" }
  },
  {
    tail: ".application.impmal.sheet .tab[data-tab=effects] .conditions .condition .pips .pip.filled",
    why: "glow",
    decls: { "box-shadow": "none" }
  },
  { tail: ".application.impmal.sheet .editor-section a.content-link.broken", why: "darkred literal", decls: brokenLink },
  { tail: ".application.impmal.sheet .editor-section a.content-link.broken i", why: "darkred literal", decls: brokenIcon },
  { tail: ".application.impmal.sheet .editor-section a.content-link img", why: "teal icon filter → brass", decls: { "filter": brassFilter } },
  { tail: ".application:not(.journal-sheet).roll-table-sheet .details a.content-link.broken", why: "darkred literal", decls: brokenLink },
  { tail: ".application:not(.journal-sheet).roll-table-sheet .details a.content-link.broken i", why: "darkred literal", decls: brokenIcon },
  { tail: ".application:not(.journal-sheet).roll-table-sheet .details a.content-link img", why: "teal icon filter → brass", decls: { "filter": brassFilter } },

  /* ── Journals: the book look becomes plate ────────────────────────────── */
  {
    tail: ".journal-sheet:not(.journal-entry-page) .journal-header",
    why: "title texture → plate",
    decls: { "background-image": "none", "background-color": "var(--navis-surface)", "border-bottom": "1px solid var(--navis-brass-dim)" }
  },
  { tail: ".journal-sheet:not(.journal-entry-page) .journal-header .title", why: "white literal", decls: { "color": "var(--navis-brass)" } },
  {
    tail: ".journal-entry.sheet .window-header",
    why: "green gradient header with a glow → flat plate",
    decls: { "background": "var(--navis-surface)", "box-shadow": "none", "border-bottom": "1px solid var(--navis-line)", "color": "var(--navis-brass)" }
  },
  {
    tail: ".journal-entry.sheet .journal-entry-content",
    why: "parchment texture → the window ground",
    decls: { "background": "var(--navis-window)", "color": "var(--navis-ink)" }
  },
  {
    tail: ".journal-entry.sheet .journal-entry-page hr",
    why: "gradient rule → brass",
    decls: {
      "background-image": "linear-gradient(90deg, transparent 0%, var(--navis-brass-dim) 50%, transparent 100%)",
      "color": "var(--navis-brass-dim)"
    }
  },
  {
    tail: ".journal-entry.sheet .journal-entry-page section.hook",
    why: "hook plaque texture and drop shadow → plate; a hook calls for action, so the edge takes alert",
    decls: {
      "border-image": "none",
      "filter": "none",
      "background": "var(--navis-raised)",
      "border": "1px solid var(--navis-line)",
      "border-left": "3px solid var(--navis-alert)",
      "clip-path": plate
    }
  },
  {
    tail: ".journal-entry.sheet .journal-entry-page section.box-text",
    why: "boxed-text texture and corner art → plate",
    decls: {
      "border-image": "none",
      "background": "var(--navis-raised)",
      "color": "var(--navis-ink)",
      "border": "1px solid var(--navis-line)",
      "border-left": "3px solid var(--navis-brass-dim)",
      "clip-path": plate
    }
  },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text .box-header", why: "white literal", decls: { "color": "var(--navis-brass)" } },
  {
    tail: ".journal-entry.sheet .journal-entry-page section.box-text.light",
    why: "light parchment variant → the lower surface",
    decls: { "color": "var(--navis-ink)", "background": "var(--navis-surface)", "border-image": "none" }
  },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text.light .box-header", why: "black literal", decls: { "color": "var(--navis-brass)" } },
  {
    tail: ".journal-entry.sheet .journal-entry-page section.box-text table thead .title",
    why: "black header text",
    decls: { "color": "var(--navis-brass)", "background": "var(--navis-raised)" }
  },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text table thead .title td:first-of-type", why: "white rule", decls: { "border-left-color": "var(--navis-line)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text table thead .title td:last-of-type", why: "white rule", decls: { "border-right-color": "var(--navis-line)" } },
  {
    tail: ".journal-entry.sheet .journal-entry-page section.box-text table thead .title > td",
    why: "white and black rules",
    decls: { "border-top-color": "var(--navis-brass-dim)", "border-bottom-color": "var(--navis-brass-dim)" }
  },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text table thead .subheader", why: "black rule", decls: { "border-top-color": "var(--navis-line)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text table thead .subheader td", why: "black rule", decls: { "border-color": "var(--navis-line)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text table tbody", why: "white literal", decls: { "color": "var(--navis-ink)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text table tbody a.content-link", why: "white literal", decls: { "color": "var(--navis-accent-lit)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text table tbody td", why: "white rule", decls: { "border-color": "var(--navis-line)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text table tbody tr", why: "white wash", decls: { "background": "transparent" } },
  {
    tail: ".journal-entry.sheet .journal-entry-page section.box-text table tbody tr:nth-of-type(even)",
    why: "white wash",
    decls: { "background": "rgba(255, 255, 255, 0.03)" }
  },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal-actor tr", why: "white row", decls: { "background-color": "var(--navis-surface)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal-actor tr:nth-of-type(even)", why: "light grey row", decls: { "background-color": "var(--navis-raised)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal-actor .title", why: "header texture", decls: tableHeaderPlate },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal-actor .title .name", why: "white rule", decls: { "border-bottom-color": "var(--navis-brass-dim)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal-actor .title .name a", why: "white literal", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal-actor .title > td", why: "white rule", decls: { "border-bottom-color": "var(--navis-brass-dim)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal-actor .npc-attributes p:first-of-type", why: "black rule", decls: { "border-bottom-color": "var(--navis-line)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal thead a.content-link", why: "white literal", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal thead .title", why: "header texture", decls: tableHeaderPlate },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal thead .title > td", why: "white rule", decls: { "border-bottom-color": "var(--navis-brass-dim)" } },
  {
    tail: ".journal-entry.sheet .journal-entry-page table.impmal thead .subheader",
    why: "header texture",
    decls: { "color": "var(--navis-ink-muted)", "background-image": "none", "background-color": "var(--navis-surface)" }
  },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal thead .subheader > td", why: "white rule", decls: { "border-right-color": "var(--navis-line)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal .separator", why: "header texture", decls: tableHeaderPlate },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal tbody tr", why: "white row", decls: { "background-color": "var(--navis-surface)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal tbody tr:nth-of-type(even)", why: "light grey row", decls: { "background-color": "var(--navis-raised)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal tbody td", why: "black rule", decls: { "border-color": "var(--navis-line)" } },
  { tail: ".journal-entry.sheet .journal-entry-page a.content-link.broken", why: "darkred literal", decls: brokenLink },
  { tail: ".journal-entry.sheet .journal-entry-page a.content-link.broken i", why: "darkred literal", decls: brokenIcon },
  { tail: ".journal-entry.sheet .journal-entry-page a.content-link img", why: "teal icon filter → brass", decls: { "filter": brassFilter } },
  /* Journal text impmal colours with its dark tokens. Teal read fine on
     parchment; with those tokens remapped to the dark scale it would sink
     into the page, so each gets a readable colour of its own. */
  { tail: ".journal-entry.sheet .journal-entry-page h1", why: "dark-token heading → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page h2", why: "dark-token heading → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page h3", why: "dark-token heading → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page h4:not(.window-title)", why: "dark-token heading → ink", decls: { "color": "var(--navis-ink-emphatic)" } },
  { tail: ".journal-entry.sheet .journal-entry-page h5", why: "dark-token heading → ink", decls: { "color": "var(--navis-ink)" } },
  { tail: ".journal-entry.sheet .journal-entry-page .blue", why: "the book's blue emphasis → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page a.content-link", why: "dark-token link → affordance", decls: { "color": "var(--navis-accent-lit)" } },
  { tail: ".journal-entry.sheet .journal-entry-page a.content-link i", why: "dark-token link icon → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text.light.blue", why: "dark-token text → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text.light a.content-link", why: "dark-token link → affordance", decls: { "color": "var(--navis-accent-lit)" } },
  { tail: ".journal-entry.sheet .journal-entry-page section.box-text.light a.content-link i", why: "dark-token link icon → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page details summary", why: "a summary opens on click → affordance", decls: { "color": "var(--navis-accent-lit)" } },
  { tail: ".journal-entry.sheet .journal-entry-page .sidebar .sidebar-title", why: "dark-token caption → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet .journal-entry-page table.impmal-actor .item-header", why: "dark-token caption → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".application:not(.journal-sheet).roll-table-sheet .details .blue", why: "the book's blue emphasis → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".application.impmal.sheet .editor-section .blue", why: "the book's blue emphasis → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: "#interface #sidebar .chat-message .message-content .blue", why: "the book's blue emphasis → brass", decls: { "color": "var(--navis-brass)" } },
  { tail: ".journal-entry.sheet input[type=search]", why: "grey literal", decls: { "color": "var(--navis-ink)" } },
  { tail: ".journal-entry.sheet footer button", why: "rounded white-text button", decls: fieldButton },
  { tail: ".journal-entry.sheet .journal-sidebar", why: "green scrollbar → brass", decls: { "--color-scrollbar": "var(--navis-brass-dim)" } },
  { tail: ".journal-entry.sheet .edit-container button", why: "green button", decls: fieldButton },
  { tail: ".journal-entry.sheet .edit-container button:hover", why: "solid green fill on hover", decls: selected },

  /* ── Sidebar and chat ─────────────────────────────────────────────────── */
  {
    tail: "#interface",
    why: "sidebar hover gradient and green scrollbar",
    decls: {
      "--sidebar-entry-hover-bg": "linear-gradient(90deg, rgba(192, 88, 31, 0.16) 0%, transparent 100%)",
      "--color-scrollbar": "var(--navis-brass-dim)"
    }
  },
  { tail: "#interface button", why: "hover floods rust-bright once the token is remapped", decls: buttonVars },
  { tail: "#interface #sidebar", why: "green scrollbar → brass", decls: { "--color-scrollbar": "var(--navis-brass-dim)" } },
  { tail: "#interface input[type=search]", why: "grey literal", decls: { "color": "var(--navis-ink)" } },
  { tail: "#interface .action-buttons button", why: "rounded white-text button", decls: fieldButton },
  { tail: "#interface .action-buttons.active", why: "solid green fill", decls: selected },
  {
    tail: "#interface #scene-navigation .ui-control",
    why: "translucent teal chip",
    decls: { "background": "rgba(20, 20, 20, 0.88)", "border-radius": "0" }
  },
  { tail: "#interface #scene-navigation .scene.view", why: "the viewed scene: solid green → lifted plate", decls: selected },
  {
    tail: "#interface #menu",
    why: "grid texture and double border → plate",
    decls: {
      "background-image": "none",
      "background-color": "var(--navis-surface)",
      "border": "1px solid var(--navis-line)",
      "border-left": "3px solid var(--navis-brass-dim)",
      "border-radius": "0"
    }
  },
  {
    tail: "#context-menu",
    why: "grid texture → plate",
    decls: {
      "background-image": "none",
      "background-color": "var(--navis-surface)",
      "border": "1px solid var(--navis-line)",
      "border-left": "3px solid var(--navis-brass-dim)",
      "border-radius": "0",
      "--hover-entry-background": "var(--navis-raised)"
    }
  },
  {
    tail: "#interface #sidebar button.ui-control",
    why: "rounded teal control with white icon",
    decls: {
      "background-color": "var(--navis-field)",
      "color": "var(--navis-ink-muted)",
      "border": "1px solid var(--navis-line)",
      "border-radius": "0",
      "transition": "background-color var(--navis-transition), color var(--navis-transition)"
    }
  },
  {
    tail: "#interface #sidebar button.ui-control:hover",
    why: "hover state for the control above",
    decls: { "background-color": "var(--navis-raised)", "color": "var(--navis-ink)" }
  },
  { tail: "#interface #sidebar button.ui-control.active", why: "active tab: solid green fill → rust edge", decls: selected },
  {
    tail: "#interface #sidebar textarea",
    why: "translucent teal field",
    decls: { "background": "var(--navis-field)", "color": "var(--navis-ink)", "border-radius": "0" }
  },
  { tail: "#interface #sidebar textarea:focus", why: "teal inset glow", decls: { "box-shadow": "inset 3px 0 0 var(--navis-accent)" } },
  { tail: "#interface #sidebar a.content-link.broken", why: "darkred literal", decls: brokenLink },
  { tail: "#interface #sidebar a.content-link.broken i", why: "darkred literal", decls: brokenIcon },
  { tail: "#interface #sidebar a.content-link img", why: "teal icon filter → brass", decls: { "filter": brassFilter } },

  {
    tail: "#interface #sidebar .chat-message",
    why: "double green border over translucent green → the same plate as a sheet panel",
    decls: {
      "background": "var(--navis-surface)",
      "color": "var(--navis-ink)",
      "border": "1px solid var(--navis-line)",
      "border-left": "3px solid var(--navis-brass-dim)",
      "clip-path": plateSm
    }
  },
  {
    tail: "#interface #sidebar .chat-message.whisper",
    why: "teal wash; a whisper lifts and brightens its edge instead",
    decls: { "background": "var(--navis-raised)", "border-left-color": "var(--navis-brass)" }
  },
  {
    tail: "#interface #sidebar .chat-message.blind",
    why: "purple wash and border, kept purple but quieter",
    decls: { "background": "rgba(122, 90, 168, 0.12)", "border-color": "var(--navis-line)", "border-left-color": "var(--navis-blind)" }
  },
  { tail: "#interface #sidebar .chat-message.highlight-delayed", why: "green inset glow", decls: { "box-shadow": "inset 3px 0 0 var(--navis-accent-lit)" } },
  { tail: "#interface #sidebar .chat-message .message-header", why: "grey literal", decls: { "color": "var(--navis-ink-muted)" } },
  { tail: "#interface #sidebar .chat-message .table-description", why: "white literal", decls: { "color": "var(--navis-ink)" } },
  { tail: "#interface #sidebar .chat-message button", why: "green button with an inset glow", decls: pressable },
  {
    tail: "#interface #sidebar .chat-message button:hover",
    why: "solid green fill on hover",
    decls: { "background-color": "var(--navis-raised)", "color": "var(--navis-ink-emphatic)" }
  },
  { tail: "#interface #sidebar .chat-message button.active", why: "solid green fill", decls: selected },
  {
    tail: "#interface #sidebar .chat-message .opposed .critical .table-roll",
    why: "glowing green chip; a critical is critical, so it takes danger",
    decls: { "box-shadow": "none", "border-radius": "0", "background": "var(--navis-field)", "border-left": "3px solid var(--navis-danger)" }
  },
  { tail: "#interface #sidebar .chat-message .dice-roll .dice-total", why: "inset glow", decls: { "box-shadow": "none" } },
  {
    tail: "#interface #sidebar .chat-message .impmal.test .sl div",
    why: "CRT grid readout → a recessed field whose colour comes from the outcome (set by module/skin.js)",
    decls: {
      "background": "var(--navis-field)",
      "background-image": "repeating-linear-gradient(0deg, rgba(184, 135, 60, 0.06) 0 1px, transparent 1px 3px)",
      "border": "1px solid var(--navis-line)",
      "border-left": "3px solid var(--navis-outcome, var(--navis-brass-dim))",
      "border-radius": "0",
      "color": "var(--navis-outcome, var(--navis-ink))",
      "font-family": "var(--navis-font-data)",
      "clip-path": plateSm
    }
  },
  {
    tail: "#interface #sidebar .chat-message .impmal.test .tags > *",
    why: "glowing green chips → stencilled brass labels",
    decls: {
      "border-radius": "0",
      "box-shadow": "none",
      "background": "var(--navis-field)",
      "border-color": "var(--navis-brass-dim)",
      "color": "var(--navis-brass)",
      "font-family": "var(--navis-font-stencil)",
      "text-transform": "uppercase",
      "letter-spacing": "1px"
    }
  },
  { tail: "#interface #sidebar .chat-message .item-use", why: "black wash", decls: { "background": "var(--navis-field)" } },
  {
    tail: "#interface #sidebar .chat-message .message-content .reward .reason",
    why: "green gradient edge → brass",
    decls: { "border-image-source": "linear-gradient(36deg, transparent 0%, var(--navis-brass) 50%, transparent 100%)" }
  },
  {
    tail: "#interface #sidebar .chat-message .message-content .reward .rewards .amount",
    why: "CRT grid readout; a reward is a gain, so it reads as success",
    decls: { "background-image": "none", "background-color": "var(--navis-field)", "color": "var(--navis-success)", "font-family": "var(--navis-font-data)" }
  },
  { tail: "#interface #sidebar .chat-message .message-content a.content-link.broken", why: "darkred literal", decls: brokenLink },
  { tail: "#interface #sidebar .chat-message .message-content a.content-link.broken i", why: "darkred literal", decls: brokenIcon },
  { tail: "#interface #sidebar .chat-message .message-content a.content-link img", why: "teal icon filter → brass", decls: { "filter": brassFilter } },
  {
    tail: ".compendium-directory.sidebar-tab .compendium-name strong::after",
    why: "green gradient underline → brass",
    decls: { "background": "linear-gradient(to right, transparent, var(--navis-brass-dim), transparent)" }
  }
];

/**
 * Themed rules with literals that we deliberately leave alone. Each one still
 * has to be named, so the audit can tell "decided" from "never looked at".
 */
const crt = "CRT animation; stopped globally by unsetting --im-shadow-anim in 00-tokens";
const overlay = "flicker overlay at opacity 0; invisible once --im-flicker-anim is unset";
const whiteOnDark = "white header link on a dark faction box; already reads on plate";

export const ignored = [
  { tail: ".application.impmal.actor .characteristic-table input:not([type=checkbox], [type=range])", why: "sets border-radius 0, which is already the skin's radius" },
  { tail: ".application.impmal.sheet .sheet-header .attribute-box.single .field input", why: "sets border-radius 0, which is already the skin's radius" },
  { tail: "#interface .resources .resource input", why: "sets border-radius 0, which is already the skin's radius" },
  { tail: ".application:not(.journal-sheet) button[data-tab]", why: "box-shadow none, already the skin's intent" },
  { tail: ".compendium-directory.sidebar-tab .window-header", why: "box-shadow none, already the skin's intent" },
  { tail: ".impmal.status-effects .effect-control .pips .pip", why: "round pips are a status count, not a panel; left round" },
  { tail: ".application:not(.journal-sheet).drag-dialog", why: "drop-target border in rust-bright: that is the affordance colour, used correctly" },
  { tail: "#interface #sidebar .chat-message .impmal.test .comparison .roll .reverse-icon", why: "text-clipped gradient on the reversed-roll icon; reads correctly in rust" },
  { tail: ".journal-entry.sheet .journal-entry-page .sidebar::before", why: "imperial eagle ornament; its colour is baked into the image" },

  { tail: ".application.impmal.actor .defending-against", why: crt },
  { tail: ".application.impmal.actor .sheet-list.influence .row-content:hover", why: crt },
  { tail: ".application.impmal.actor .sheet-list.skills .row-content:not(.list-header):hover", why: crt },
  { tail: ".application.impmal.actor .tab[data-tab=powers].active .purge:hover", why: crt },
  { tail: ".warhammer.application div.sheet-list .list-row:not(.list-header, .no-scan) .row-content:hover", why: crt },
  { tail: ".application:not(.journal-sheet).advancement .overspent", why: crt },
  { tail: "#interface #sidebar .chat-message .dice-total", why: crt },
  { tail: "#pause", why: crt },

  { tail: ".application.impmal.actor .defending-against::after", why: overlay },
  { tail: ".application.impmal.actor .sheet-list.influence .row-content:hover::after", why: overlay },
  { tail: ".application.impmal.actor .sheet-list.skills .row-content:not(.list-header):hover::after", why: overlay },
  { tail: ".application.impmal.actor .tab[data-tab=powers].active .purge:hover::after", why: overlay },
  { tail: ".warhammer.application div.sheet-list .list-row:not(.list-header, .no-scan) .row-content:hover::after", why: overlay },
  { tail: ".application:not(.journal-sheet) nav.sheet-tabs a[data-tab].active::after", why: overlay },
  { tail: ".application:not(.journal-sheet).advancement .overspent::after", why: overlay },
  { tail: "#interface #sidebar .chat-message .dice-total::after", why: overlay },
  { tail: "#interface #sidebar .chat-message .impmal.test .sl div::after", why: overlay },
  { tail: "#interface #sidebar .chat-message .message-content .reward .rewards .amount::after", why: overlay },
  { tail: "#pause::after", why: overlay },

  { tail: ".application:not(.journal-sheet).roll-table-sheet .details .impmal-embed.faction section.box-text.dark .box-header a.content-link", why: whiteOnDark },
  { tail: ".application:not(.journal-sheet).roll-table-sheet .details .impmal-embed.faction section.box-text.dark .box-header a.content-link i", why: whiteOnDark },
  { tail: ".application.impmal.sheet .editor-section .impmal-embed.faction section.box-text.dark .box-header a.content-link", why: whiteOnDark },
  { tail: ".application.impmal.sheet .editor-section .impmal-embed.faction section.box-text.dark .box-header a.content-link i", why: whiteOnDark },
  { tail: ".journal-entry.sheet .journal-entry-page .impmal-embed.faction section.box-text.dark .box-header a.content-link", why: whiteOnDark },
  { tail: ".journal-entry.sheet .journal-entry-page .impmal-embed.faction section.box-text.dark .box-header a.content-link i", why: whiteOnDark },
  { tail: "#interface #sidebar .impmal-embed.faction section.box-text.dark .box-header a.content-link", why: whiteOnDark },
  { tail: "#interface #sidebar .impmal-embed.faction section.box-text.dark .box-header a.content-link i", why: whiteOnDark },
  { tail: "#interface #sidebar .chat-message .message-content .impmal-embed.faction section.box-text.dark .box-header a.content-link", why: whiteOnDark },
  { tail: "#interface #sidebar .chat-message .message-content .impmal-embed.faction section.box-text.dark .box-header a.content-link i", why: whiteOnDark }
];
