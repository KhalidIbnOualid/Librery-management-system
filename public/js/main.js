'use strict';

// Auto-dismiss flash alerts after 5 seconds
document.addEventListener('DOMContentLoaded', () => {
  const alerts = document.querySelectorAll('.alert.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) bsAlert.close();
    }, 5000);
  });

  // Dynamic subcategory filter on books page
  const categorySelect = document.getElementById('categoryFilter');
  const subcatSelect   = document.getElementById('subcategoryFilter');
  if (categorySelect && subcatSelect) {
    const allOptions = Array.from(subcatSelect.options);

    function filterSubs() {
      const catId = categorySelect.value;
      subcatSelect.innerHTML = '<option value="">All Subcategories</option>';
      allOptions.forEach(opt => {
        if (!opt.value) return;
        if (!catId || opt.dataset.catId === catId) {
          subcatSelect.appendChild(opt.cloneNode(true));
        }
      });
    }

    categorySelect.addEventListener('change', () => {
      filterSubs();
      // Also reset subcategory selection when category changes
      subcatSelect.value = '';
    });

    filterSubs();
  }
});
