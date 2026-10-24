/**
 * 11's Kitchen – Custom Cake Order Form
 * All business rules, dynamic pricing, restrictions & validation.
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // PRICE DATA
  // All prices are per 1 kg (from menu). Stored here so JS
  // is the single source of truth for calculations.
  // ─────────────────────────────────────────────────────────
  const FLAVOUR_PRICES = {
    vanilla_tres_leches: 1150, lemon: 1250, tender_coconut: 1250,
    caramel_salted: 1275, coffee_caramel: 1300, mocha: 1300,
    tiramisu: 1350, boston_cream_pie: 1400, red_velvet: 1400,
    rose_milk: 1450, snickers: 1650, ras_malai_without: 1650,
    ras_malai_with: 1750, belgian_chocolate: 1950, nutella_truffle: 1950,
    pistachio: 1950, rose_pistachio: 1950, opera: 2700,
    butterscotch: 950, mango: 950, pineapple: 950, strawberry: 950,
    blackcurrant: 950, classic_chocolate: 1150, black_forest: 1250,
    white_forest: 1250, chocolate_truffle: 1500
  };

  // Vegan: special flavours get +500/kg, all others +100/kg
  const VEGAN_PREMIUM_FLAVOURS = [
    'rose_milk', 'vanilla_tres_leches', 'ras_malai_without', 'ras_malai_with', 'tender_coconut'
  ];

  // Flavours that cannot be Custom Design or Doll
  const RESTRICTED_FLAVOURS = ['tiramisu', 'opera', 'boston_cream_pie'];

  // Flavours where Vegan is not available
  const NO_VEGAN_FLAVOURS = ['white_forest', 'tiramisu', 'red_velvet'];

  // Size → weight in kg (for price calculation)
  const SIZE_KG = {
    '800g': 0.8, '1kg': 1, '1.5kg': 1.5,
    '2kg': 2, '2.5kg': 2.5, '3kg': 3, 'custom': null
  };

  // Buttercream: ₹300 for first kg, ₹200 for every additional kg
  function calcButtercreamCharge(kg) {
    if (!kg) return 0;
    if (kg <= 1) return 300;
    return 300 + Math.round((kg - 1) * 200);
  }

  // ─────────────────────────────────────────────────────────
  // ELEMENT REFS
  // ─────────────────────────────────────────────────────────
  const flavourSelect        = document.getElementById('cake-flavour');
  const priceDisplay         = document.getElementById('price-display');
  const priceValue           = document.getElementById('price-value');
  const flavourRestrNote     = document.getElementById('flavour-restriction-note');

  const buttercreamYes       = document.getElementById('buttercream-yes');
  const buttercreamNo        = document.getElementById('buttercream-no');
  const buttercreamInfo      = document.getElementById('buttercream-info');

  const veganYes             = document.getElementById('vegan-yes');
  const veganNo              = document.getElementById('vegan-no');
  const veganNote            = document.getElementById('vegan-note');
  const veganRestrNote       = document.getElementById('vegan-restriction-note');
  const labelVeganYes        = document.getElementById('label-vegan-yes');

  const tieredYes            = document.getElementById('tiered-yes');
  const tieredNo             = document.getElementById('tiered-no');

  const shapeSelect          = document.getElementById('cake-shape');
  const dollNote             = document.getElementById('doll-shape-note');
  const customShapeGroup     = document.getElementById('group-custom-shape');
  const customShapeDesc      = document.getElementById('custom-shape-desc');

  const sizeSelect           = document.getElementById('cake-size');
  const customSizeGroup      = document.getElementById('group-custom-size');
  const customSizeDesc       = document.getElementById('custom-size-desc');
  const estimatedTotal       = document.getElementById('estimated-total');
  const estValue             = document.getElementById('est-value');
  const estNote              = document.getElementById('est-note');

  const designBakers         = document.getElementById('design-bakers');
  const designCustom         = document.getElementById('design-custom');
  const customDesignFields   = document.getElementById('custom-design-fields');
  const designDesc           = document.getElementById('design-desc');
  const refImage             = document.getElementById('ref-image');
  const designRestrNote      = document.getElementById('design-restriction-note');
  const labelCustomDesign    = document.getElementById('label-custom-design');

  const cakeMessage          = document.getElementById('cake-message');
  const deliveryDate         = document.getElementById('delivery-date');

  const pickupRadio          = document.getElementById('delivery-pickup');
  const deliveryRadio        = document.getElementById('delivery-needed');
  const pickupOnlyNote       = document.getElementById('pickup-only-note');
  const addressGroup         = document.getElementById('group-address');
  const addressField         = document.getElementById('delivery-address');

  const confirmCheckbox      = document.getElementById('confirm-checkbox');
  const form                 = document.getElementById('custom-cake-form');
  const modalOverlay         = document.getElementById('modal-overlay');

  // ─────────────────────────────────────────────────────────
  // UTILITY HELPERS
  // ─────────────────────────────────────────────────────────
  const show = (el) => { if (el) el.style.display = ''; };
  const hide = (el) => { if (el) el.style.display = 'none'; };

  function setOptionDisabled(select, value, disabled) {
    const opt = select.querySelector(`option[value="${value}"]`);
    if (!opt) return;
    opt.disabled = disabled;
    if (disabled && select.value === value) {
      const firstEnabled = Array.from(select.options).find(o => !o.disabled && o.value !== '');
      if (firstEnabled) select.value = firstEnabled.value;
    }
  }

  function markError(inputEl, errorId, message) {
    if (inputEl) inputEl.classList.add('input-error');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(inputEl, errorId) {
    if (inputEl) inputEl.classList.remove('input-error');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = '';
  }

  function formatINR(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  }

  // ─────────────────────────────────────────────────────────
  // MINIMUM DATE – no past dates allowed
  // ─────────────────────────────────────────────────────────
  (function setMinDate() {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    deliveryDate.min = `${yyyy}-${mm}-${dd}`;
  })();

  // ─────────────────────────────────────────────────────────
  // CORE PRICE CALCULATION
  // Called whenever flavour / vegan / buttercream / size changes
  // ─────────────────────────────────────────────────────────
  function calcAndDisplayPrices() {
    const flavour  = flavourSelect.value;
    const isVegan  = veganYes.checked;
    const isBC     = buttercreamYes.checked;
    const sizeVal  = sizeSelect.value;
    const kg       = SIZE_KG[sizeVal] || null;

    if (!flavour) {
      hide(priceDisplay);
      hide(estimatedTotal);
      return;
    }

    // ── Per-kg base price ──────────────────────────────────
    let basePerKg = FLAVOUR_PRICES[flavour] || 0;

    // Vegan surcharge per kg
    let veganPerKg = 0;
    if (isVegan && !veganYes.disabled) {
      veganPerKg = VEGAN_PREMIUM_FLAVOURS.includes(flavour) ? 500 : 100;
    }

    const totalPerKg = basePerKg + veganPerKg;

    // ── Starting price for 800 g ───────────────────────────
    const price800g = Math.round(totalPerKg * 0.8);
    priceValue.textContent = formatINR(price800g);
    show(priceDisplay);

    // ── Estimated total (only when size is not custom) ─────
    if (kg !== null) {
      let total = totalPerKg * kg;
      if (isBC) total += calcButtercreamCharge(kg);
      estValue.textContent = formatINR(total);
      show(estimatedTotal);

      const isTiered  = tieredYes.checked;
      const isCustomSz = sizeVal === 'custom';
      (isTiered || isCustomSz) ? show(estNote) : hide(estNote);
    } else {
      // Custom size – show estimate with disclaimer
      let total = totalPerKg; // approximate 1 kg
      if (isBC) total += 300;
      estValue.textContent = formatINR(total) + '+';
      show(estimatedTotal);
      show(estNote);
    }
  }

  // ─────────────────────────────────────────────────────────
  // FLAVOUR RESTRICTIONS
  // Tiramisu, OPERA, Boston Cream Pie → disable Custom Design & Doll
  // ─────────────────────────────────────────────────────────
  function applyFlavourRestrictions() {
    const flavour     = flavourSelect.value;
    const isRestricted = RESTRICTED_FLAVOURS.includes(flavour);

    // Show/hide note near flavour dropdown
    isRestricted ? show(flavourRestrNote) : hide(flavourRestrNote);

    // Disable Custom Design
    if (isRestricted) {
      labelCustomDesign.classList.add('radio-disabled');
      designCustom.disabled = true;
      if (designCustom.checked) {
        designBakers.checked = true;
        applyDesignRules();
      }
      show(designRestrNote);
    } else {
      labelCustomDesign.classList.remove('radio-disabled');
      designCustom.disabled = false;
      hide(designRestrNote);
    }

    // Disable Doll shape option
    setOptionDisabled(shapeSelect, 'doll', isRestricted);
    if (isRestricted && shapeSelect.value === 'doll') {
      shapeSelect.value = '';
      applyShapeRules();
    }

    // Check vegan restrictions
    applyVeganRestrictions();
  }

  // ─────────────────────────────────────────────────────────
  // VEGAN RESTRICTIONS
  // White Forest, Tiramisu, Red Velvet or Buttercream=Yes → disable Vegan
  // ─────────────────────────────────────────────────────────
  function applyVeganRestrictions() {
    const flavour = flavourSelect.value;
    const isBC    = buttercreamYes.checked;
    const cantVegan = NO_VEGAN_FLAVOURS.includes(flavour) || isBC;

    if (cantVegan) {
      labelVeganYes.classList.add('radio-disabled');
      veganYes.disabled = true;
      if (veganYes.checked) {
        veganNo.checked = true;
        hide(veganNote);
      }
      show(veganRestrNote);
    } else {
      labelVeganYes.classList.remove('radio-disabled');
      veganYes.disabled = false;
      hide(veganRestrNote);
    }

    calcAndDisplayPrices();
  }

  // ─────────────────────────────────────────────────────────
  // TIERED CAKE RULES
  // ─────────────────────────────────────────────────────────
  function applyTieredRules() {
    const isTiered = tieredYes.checked;
    ['800g', '1kg', '1.5kg'].forEach(v => setOptionDisabled(sizeSelect, v, isTiered));
    applyPickupOnlyRules();
    calcAndDisplayPrices();
  }

  // ─────────────────────────────────────────────────────────
  // SHAPE RULES
  // ─────────────────────────────────────────────────────────
  function applyShapeRules() {
    const shape     = shapeSelect.value;
    const isTiered  = tieredYes.checked;
    const disable800g = shape === 'doll' || shape === 'hexagon' || isTiered;

    setOptionDisabled(sizeSelect, '800g', disable800g);
    // Hexagon also disabled when size is 800g (handled by size change too)

    // Doll note
    shape === 'doll' ? show(dollNote) : hide(dollNote);

    // Custom shape text box
    if (shape === 'custom') {
      show(customShapeGroup);
      customShapeDesc.required = true;
    } else {
      hide(customShapeGroup);
      customShapeDesc.required = false;
      customShapeDesc.value = '';
      clearFieldError(customShapeDesc, 'error-custom-shape');
    }

    applyPickupOnlyRules();
  }

  // ─────────────────────────────────────────────────────────
  // SIZE RULES
  // ─────────────────────────────────────────────────────────
  function applySizeRules() {
    const size = sizeSelect.value;

    // Custom size text box
    if (size === 'custom') {
      show(customSizeGroup);
      customSizeDesc.required = true;
    } else {
      hide(customSizeGroup);
      customSizeDesc.required = false;
      customSizeDesc.value = '';
      clearFieldError(customSizeDesc, 'error-custom-size');
    }

    // Hexagon disabled for 800g
    const hexOpt = shapeSelect.querySelector('option[value="hexagon"]');
    if (hexOpt) {
      if (size === '800g' && shapeSelect.value === 'hexagon') {
        shapeSelect.value = '';
      }
    }

    applyPickupOnlyRules();
    calcAndDisplayPrices();
  }

  // ─────────────────────────────────────────────────────────
  // DESIGN PREFERENCE RULES
  // ─────────────────────────────────────────────────────────
  function applyDesignRules() {
    if (designCustom.checked && !designCustom.disabled) {
      show(customDesignFields);
      designDesc.required = true;
    } else {
      hide(customDesignFields);
      designDesc.required = false;
      designDesc.value = '';
      if (refImage) refImage.value = '';
      clearFieldError(designDesc, 'error-design-desc');
      clearFieldError(refImage, 'error-ref-image');
    }
  }

  // ─────────────────────────────────────────────────────────
  // PICKUP-ONLY RULES
  // Tiered / Doll / Size > 2 kg → force Self Pickup
  // ─────────────────────────────────────────────────────────
  function applyPickupOnlyRules() {
    const isTiered  = tieredYes.checked;
    const isDoll    = shapeSelect.value === 'doll';
    const sizeLarge = ['2.5kg', '3kg', 'custom'].includes(sizeSelect.value);
    const forcePickup = isTiered || isDoll || sizeLarge;

    if (forcePickup) {
      deliveryRadio.disabled = true;
      pickupRadio.checked    = true;
      deliveryRadio.checked  = false;
      show(pickupOnlyNote);
      hide(addressGroup);
      addressField.required = false;
    } else {
      deliveryRadio.disabled = false;
      hide(pickupOnlyNote);
    }
  }

  // ─────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────

  // Flavour
  flavourSelect.addEventListener('change', () => {
    clearFieldError(flavourSelect, 'error-flavour');
    applyFlavourRestrictions();
    calcAndDisplayPrices();
  });

  // Buttercream
  buttercreamYes.addEventListener('change', () => {
    show(buttercreamInfo);
    applyVeganRestrictions(); // buttercream blocks vegan
    calcAndDisplayPrices();
  });
  buttercreamNo.addEventListener('change', () => {
    hide(buttercreamInfo);
    applyVeganRestrictions();
    calcAndDisplayPrices();
  });

  // Vegan
  veganYes.addEventListener('change', () => {
    show(veganNote);
    calcAndDisplayPrices();
  });
  veganNo.addEventListener('change', () => {
    hide(veganNote);
    calcAndDisplayPrices();
  });

  // Tiered
  tieredYes.addEventListener('change', applyTieredRules);
  tieredNo.addEventListener('change',  applyTieredRules);

  // Shape
  shapeSelect.addEventListener('change', () => {
    clearFieldError(shapeSelect, 'error-shape');
    applyShapeRules();
  });

  // Size
  sizeSelect.addEventListener('change', () => {
    clearFieldError(sizeSelect, 'error-size');
    applySizeRules();
  });

  // Design
  designBakers.addEventListener('change', applyDesignRules);
  designCustom.addEventListener('change', applyDesignRules);

  // Delivery mode
  pickupRadio.addEventListener('change', () => {
    hide(addressGroup);
    addressField.required = false;
    clearFieldError(addressField, 'error-address');
  });
  deliveryRadio.addEventListener('change', () => {
    if (!deliveryRadio.disabled) {
      show(addressGroup);
      addressField.required = true;
    }
  });

  // Message word count
  cakeMessage.addEventListener('input', () => {
    const words = cakeMessage.value.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length > 10) {
      markError(cakeMessage, 'error-message', 'Maximum 10 words allowed.');
    } else {
      clearFieldError(cakeMessage, 'error-message');
    }
  });

  // Reference image validation
  if (refImage) {
    refImage.addEventListener('change', () => {
      const file = refImage.files[0];
      if (!file) return;
      const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
      const max     = 10 * 1024 * 1024;
      if (!allowed.includes(file.type)) {
        markError(refImage, 'error-ref-image', 'Only JPG, JPEG, or PNG files are accepted.');
        refImage.value = '';
      } else if (file.size > max) {
        markError(refImage, 'error-ref-image', 'File size must not exceed 10 MB.');
        refImage.value = '';
      } else {
        clearFieldError(refImage, 'error-ref-image');
      }
    });
  }

  // Live field clearing
  const phoneField = document.getElementById('customer-phone');
  const emailField = document.getElementById('customer-email');
  const nameField  = document.getElementById('customer-name');

  phoneField.addEventListener('input', () => {
    phoneField.value = phoneField.value.replace(/\D/g, '').slice(0, 10);
    clearFieldError(phoneField, 'error-phone');
  });
  emailField.addEventListener('input',  () => clearFieldError(emailField, 'error-email'));
  nameField.addEventListener('input',   () => clearFieldError(nameField, 'error-name'));
  deliveryDate.addEventListener('change', () => clearFieldError(deliveryDate, 'error-date'));

  // ─────────────────────────────────────────────────────────
  // FORM SUBMISSION & VALIDATION
  // ─────────────────────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    // Flavour
    if (!flavourSelect.value) {
      markError(flavourSelect, 'error-flavour', 'Please select a flavour.');
      valid = false;
    } else { clearFieldError(flavourSelect, 'error-flavour'); }

    // Shape
    if (!shapeSelect.value) {
      markError(shapeSelect, 'error-shape', 'Please select a shape.');
      valid = false;
    } else { clearFieldError(shapeSelect, 'error-shape'); }

    // Custom shape
    if (shapeSelect.value === 'custom' && !customShapeDesc.value.trim()) {
      markError(customShapeDesc, 'error-custom-shape', 'Please describe your preferred shape.');
      valid = false;
    } else { clearFieldError(customShapeDesc, 'error-custom-shape'); }

    // Size
    if (!sizeSelect.value) {
      markError(sizeSelect, 'error-size', 'Please select a size.');
      valid = false;
    } else { clearFieldError(sizeSelect, 'error-size'); }

    // Custom size
    if (sizeSelect.value === 'custom' && !customSizeDesc.value.trim()) {
      markError(customSizeDesc, 'error-custom-size', 'Please describe your size requirement.');
      valid = false;
    } else { clearFieldError(customSizeDesc, 'error-custom-size'); }

    // Design description
    if (designCustom.checked && !designCustom.disabled && !designDesc.value.trim()) {
      markError(designDesc, 'error-design-desc', 'Please describe your design theme.');
      valid = false;
    } else { clearFieldError(designDesc, 'error-design-desc'); }

    // Message word count
    const msgWords = cakeMessage.value.trim().split(/\s+/).filter(w => w.length > 0);
    if (cakeMessage.value.trim() && msgWords.length > 10) {
      markError(cakeMessage, 'error-message', 'Maximum 10 words allowed.');
      valid = false;
    } else { clearFieldError(cakeMessage, 'error-message'); }

    // Delivery date
    if (!deliveryDate.value) {
      markError(deliveryDate, 'error-date', 'Please select a delivery or pickup date.');
      valid = false;
    } else {
      const chosen = new Date(deliveryDate.value);
      const today  = new Date(); today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        markError(deliveryDate, 'error-date', 'Past dates are not allowed.');
        valid = false;
      } else { clearFieldError(deliveryDate, 'error-date'); }
    }

    // Preferred time
    const prefTime = document.getElementById('preferred-time');
    if (!prefTime.value) {
      markError(prefTime, 'error-time', 'Please select a preferred time.');
      valid = false;
    } else { clearFieldError(prefTime, 'error-time'); }

    // Name
    if (!nameField.value.trim()) {
      markError(nameField, 'error-name', 'Please enter your name.');
      valid = false;
    } else { clearFieldError(nameField, 'error-name'); }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailField.value.trim()) {
      markError(emailField, 'error-email', 'Please enter your email address.');
      valid = false;
    } else if (!emailRegex.test(emailField.value.trim())) {
      markError(emailField, 'error-email', 'Please enter a valid email address.');
      valid = false;
    } else { clearFieldError(emailField, 'error-email'); }

    // Phone
    const phoneRegex = /^\d{10}$/;
    if (!phoneField.value.trim()) {
      markError(phoneField, 'error-phone', 'Please enter your phone number.');
      valid = false;
    } else if (!phoneRegex.test(phoneField.value.trim())) {
      markError(phoneField, 'error-phone', 'Please enter a valid 10-digit mobile number.');
      valid = false;
    } else { clearFieldError(phoneField, 'error-phone'); }

    // Address
    if (deliveryRadio.checked && !addressField.value.trim()) {
      markError(addressField, 'error-address', 'Please enter your delivery address.');
      valid = false;
    } else { clearFieldError(addressField, 'error-address'); }

    // Confirmation
    const errConfirm = document.getElementById('error-confirm');
    if (!confirmCheckbox.checked) {
      if (errConfirm) errConfirm.textContent = 'Please confirm that the details are correct.';
      valid = false;
    } else {
      if (errConfirm) errConfirm.textContent = '';
    }

    if (!valid) {
      const firstError = form.querySelector('.input-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // All valid → show success modal
    modalOverlay.style.display = 'flex';
  });

})();
