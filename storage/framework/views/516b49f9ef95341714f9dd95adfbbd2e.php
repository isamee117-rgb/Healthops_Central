<?php $__env->startPush('styles'); ?>
<style>
    .page-content:has(.pharmacy-container) {
        padding: 0 !important;
        gap: 0 !important;
        overflow: hidden;
    }
    body:has(.pharmacy-container) { overflow-x: hidden; }
    .pharmacy-container {
        display: flex;
        width: calc(100vw - var(--sidebar-width));
        max-width: calc(100vw - var(--sidebar-width));
        height: calc(100vh - 110px);
        overflow: hidden;
        background: #f8f9fa;
    }
    .sidebar.collapsed ~ .main-content .pharmacy-container {
        width: calc(100vw - var(--sidebar-collapsed-width));
        max-width: calc(100vw - var(--sidebar-collapsed-width));
    }
    .pharmacy-left {
        flex: 70;
        min-width: 0;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #e2e8f0;
        background: #fff;
    }
    .pharmacy-right {
        flex: 30;
        min-width: 0;
        display: flex;
        flex-direction: column;
        background: #fff;
        border-left: 1px solid #e2e8f0;
        height: 100%;
        overflow: hidden;
    }
    .pharmacy-search-area {
        padding: 16px;
        border-bottom: 1px solid #e2e8f0;
    }
    .pharmacy-search-area .search-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .pharmacy-search-wrap {
        position: relative;
        flex: 1;
    }
    .pharmacy-search-wrap .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
        width: 20px;
        height: 20px;
    }
    .pharmacy-search-wrap input {
        width: 100%;
        padding: 12px 90px 12px 48px;
        font-size: 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8f9fa;
    }
    .pharmacy-search-wrap input:focus {
        outline: none;
        border-color: #7FFFD4;
        box-shadow: 0 0 0 3px rgba(127,255,212,0.15);
    }
    .pharmacy-search-wrap .search-actions {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .pharmacy-search-wrap .search-actions button {
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        color: #94a3b8;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .pharmacy-search-wrap .search-actions button:hover {
        color: #003366;
        background: #f1f5f9;
    }
    .view-toggle {
        display: flex;
        gap: 2px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 4px;
        background: #f8f9fa;
    }
    .view-toggle button {
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
    }
    .view-toggle button.active {
        background: #fff;
        color: #003366;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .category-scroll {
        display: flex;
        flex-wrap: nowrap;
        gap: 8px;
        overflow-x: auto;
        padding: 12px 0 8px;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 transparent;
    }
    .category-scroll::-webkit-scrollbar { height: 4px; }
    .category-scroll::-webkit-scrollbar-track { background: transparent; }
    .category-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    .category-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    .category-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 50px;
        background: #fff;
        color: #64748b;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.15s;
    }
    .category-btn:hover {
        border-color: #003366;
        color: #003366;
    }
    .category-btn.active {
        background: #003366;
        color: #fff;
        border-color: #003366;
    }
    .category-btn i { width: 14px; height: 14px; }
    .medicine-area {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f8f9fa;
    }
    .medicine-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }
    .med-card {
        background: #fff;
        border: 1px solid #e8ecf0;
        border-radius: 10px;
        padding: 10px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .med-card:hover {
        box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        transform: translateY(-1px);
    }
    .med-card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
    }
    .med-icon-box {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: rgba(127,255,212,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #003366;
    }
    .stock-badge {
        display: inline-flex;
        padding: 2px 8px;
        border-radius: 50px;
        font-size: 10px;
        font-weight: 600;
    }
    .stock-badge.in-stock { background: #dcfce7; color: #15803d; }
    .stock-badge.low-stock { background: #ffedd5; color: #c2410c; }
    .stock-badge.critical { background: #fef2f2; color: #b91c1c; }
    .med-card-info { flex: 1; }
    .med-card-info h3 {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.3;
        color: #1e293b;
        margin: 0;
        transition: color 0.15s;
    }
    .med-card:hover .med-card-info h3 { color: #003366; }
    .med-card-info .generic {
        font-size: 11px;
        color: #64748b;
        margin: 1px 0;
    }
    .med-card-info .meta {
        font-size: 10px;
        color: #94a3b8;
    }
    .med-card-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 8px;
        border-top: 1px solid #f1f5f9;
    }
    .med-card-bottom .price-label { font-size: 10px; color: #94a3b8; }
    .med-card-bottom .price {
        font-size: 14px;
        font-weight: 700;
        color: #003366;
    }
    .btn-add-cart {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 4px 10px;
        border: none;
        border-radius: 6px;
        background: rgba(127,255,212,0.15);
        color: #003366;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
    }
    .btn-add-cart:hover {
        background: #003366;
        color: #fff;
    }
    .medicine-list-view .list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #fff;
        border: 1px solid #e8ecf0;
        border-radius: 10px;
        margin-bottom: 8px;
        transition: box-shadow 0.15s;
    }
    .medicine-list-view .list-item:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .list-item-left {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .list-item-left .icon-box {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: rgba(127,255,212,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #003366;
    }
    .list-item-left h3 { font-weight: 700; margin: 0; font-size: 14px; }
    .list-item-left .sub { font-size: 12px; color: #94a3b8; }
    .list-item-right {
        display: flex;
        align-items: center;
        gap: 24px;
    }
    .list-item-right .price {
        text-align: right;
    }
    .list-item-right .price strong {
        display: block;
        font-size: 14px;
        color: #003366;
        font-weight: 700;
    }
    .list-item-right .price small {
        font-size: 11px;
        color: #94a3b8;
    }
    .customer-section {
        padding: 10px 12px;
        border-bottom: 1px solid #e2e8f0;
        background: #f8f9fa;
    }
    .customer-tabs {
        display: flex;
        background: #e2e8f0;
        border-radius: 6px;
        padding: 2px;
        margin-bottom: 8px;
    }
    .customer-tabs button {
        flex: 1;
        padding: 5px;
        border: none;
        background: transparent;
        border-radius: 5px;
        font-size: 12px;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        transition: all 0.15s;
    }
    .customer-tabs button.active {
        background: #fff;
        color: #1e293b;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .customer-content .walkin-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: #fff;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
    }
    .walkin-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        flex-shrink: 0;
    }
    .customer-content .search-row {
        display: flex;
        gap: 8px;
    }
    .customer-content .search-row input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 13px;
        background: #fff;
    }
    .customer-content .new-fields input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 13px;
        background: #fff;
        margin-bottom: 8px;
    }
    .cart-header {
        padding: 8px 12px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
    }
    .cart-header h3 {
        font-weight: 700;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0;
    }
    .cart-header h3 i { color: #003366; }
    .cart-header .item-count {
        font-weight: 400;
        color: #94a3b8;
        font-size: 13px;
    }
    .btn-clear-cart {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border: none;
        background: transparent;
        color: #ef4444;
        font-size: 12px;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
    }
    .btn-clear-cart:hover { background: rgba(239,68,68,0.08); }
    .cart-items {
        flex: 1;
        overflow-y: auto;
        padding: 8px 10px;
        background: #fafbfc;
        min-height: 0;
    }
    .cart-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #94a3b8;
        opacity: 0.5;
        text-align: center;
    }
    .cart-empty i { width: 40px; height: 40px; margin-bottom: 8px; }
    .cart-empty p { margin: 2px 0; font-size: 13px; }
    .cart-empty .hint { font-size: 11px; max-width: 200px; }
    .cart-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: #fff;
        border: 1px solid #e8ecf0;
        border-radius: 8px;
        margin-bottom: 6px;
        position: relative;
    }
    .cart-item:hover .cart-item-remove { opacity: 1; }
    .cart-item-info { flex: 1; min-width: 0; }
    .cart-item-info h4 {
        font-size: 12px;
        font-weight: 600;
        margin: 0 0 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .cart-item-info .qty-price {
        font-size: 11px;
        color: #94a3b8;
    }
    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }
    .qty-stepper {
        display: flex;
        align-items: center;
        gap: 0;
        background: #f1f5f9;
        border-radius: 6px;
        height: 26px;
    }
    .qty-stepper button {
        width: 24px;
        height: 26px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
    }
    .qty-stepper button:hover { background: rgba(0,0,0,0.04); }
    .qty-stepper .qty-val {
        width: 26px;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
    }
    .qty-stepper input.qty-input {
        width: 36px;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        border: none;
        background: transparent;
        outline: none;
        padding: 0;
        color: inherit;
        -moz-appearance: textfield;
    }
    .qty-stepper input.qty-input::-webkit-outer-spin-button,
    .qty-stepper input.qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .qty-stepper input.qty-input:focus {
        background: #fff;
        border-radius: 3px;
        box-shadow: 0 0 0 2px #3b82f640;
    }
    .cart-item-total {
        text-align: right;
        min-width: 50px;
    }
    .cart-item-total strong {
        font-size: 12px;
        font-weight: 700;
    }
    .cart-item-remove {
        position: absolute;
        right: 8px;
        top: 8px;
        width: 20px;
        height: 20px;
        border: none;
        background: transparent;
        color: #94a3b8;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .cart-item-remove:hover { color: #ef4444; }
    .bill-section {
        background: #fff;
        border-top: 1px solid #e2e8f0;
        padding: 10px 12px;
        box-shadow: 0 -5px 25px rgba(0,0,0,0.05);
        z-index: 20;
        flex-shrink: 0;
    }
    .rx-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f1f5f9;
    }
    .rx-toggle label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #64748b;
        cursor: pointer;
    }
    .rx-alert {
        margin-bottom: 8px;
        padding: 6px 10px;
        background: #eff6ff;
        border: 1px solid #dbeafe;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .rx-alert .info {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #1d4ed8;
    }
    .rx-alert .btn-upload {
        padding: 3px 10px;
        border: 1px solid #bfdbfe;
        background: #fff;
        color: #1d4ed8;
        border-radius: 6px;
        font-size: 11px;
        cursor: pointer;
    }
    .bill-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin-bottom: 4px;
    }
    .bill-row .label { color: #94a3b8; }
    .bill-row.discount .value { color: #16a34a; }
    .bill-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 6px;
        margin-bottom: 8px;
        border-top: 1px solid #e2e8f0;
    }
    .bill-total .total-label {
        font-size: 14px;
        font-weight: 700;
    }
    .bill-total .total-value {
        font-size: 22px;
        font-weight: 700;
        color: #003366;
    }
    .payment-methods {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        margin-bottom: 8px;
    }
    .pay-method-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5px 3px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        transition: all 0.15s;
        color: #94a3b8;
    }
    .pay-method-btn:hover { background: #f8f9fa; }
    .pay-method-btn.active {
        background: rgba(127,255,212,0.12);
        border-color: #003366;
        color: #003366;
    }
    .pay-method-btn i { width: 14px; height: 14px; margin-bottom: 1px; }
    .pay-method-btn span {
        font-size: 7px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    .btn-complete-sale {
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 10px;
        background: #003366;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.15s;
        box-shadow: 0 4px 15px rgba(0,51,102,0.2);
    }
    .btn-complete-sale:hover:not(:disabled) {
        background: #002244;
        transform: translateY(-1px);
    }
    .btn-complete-sale:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .modal .medicine-detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        padding: 16px 0;
    }
    .detail-section h4 {
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 12px;
    }
    .detail-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px;
        font-size: 13px;
    }
    .detail-grid .dlabel { color: #94a3b8; }
    .detail-grid .dvalue { font-weight: 500; }
    .detail-grid .dvalue.mono { font-family: monospace; }
    .detail-grid .dvalue.expiry { color: #ea580c; font-weight: 600; }
    .detail-desc {
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-top: 12px;
    }
    .detail-desc p {
        font-size: 13px;
        font-style: italic;
        color: #64748b;
        margin: 0;
    }
    .stock-pricing-card {
        padding: 16px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #fafbfc;
    }
    .stock-pricing-card .sp-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
    }
    .stock-pricing-card .sp-row + .sp-row {
        border-top: 1px solid #e2e8f0;
    }
    .stock-pricing-card .sp-label { font-size: 13px; color: #94a3b8; }
    .stock-pricing-card .sp-value { font-weight: 700; font-size: 16px; }
    .stock-pricing-card .sp-value.stock-val {
        padding: 3px 10px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 13px;
    }
    .stock-pricing-card .sp-value.unit-price { font-weight: 500; font-size: 14px; }
    .rx-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
        border-radius: 10px;
        margin-top: 12px;
        font-size: 13px;
    }
    .rx-warning i { flex-shrink: 0; }
    .medicine-empty {
        text-align: center;
        padding: 60px 20px;
        color: #94a3b8;
    }
    .medicine-empty i { width: 48px; height: 48px; margin-bottom: 12px; }
    .medicine-empty h4 { margin: 0 0 4px; color: #64748b; }
    .medicine-empty p { font-size: 13px; }
    .form-switch-custom {
        position: relative;
        width: 44px;
        height: 24px;
    }
    .form-switch-custom input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .form-switch-custom .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background: #cbd5e1;
        border-radius: 24px;
        transition: 0.2s;
    }
    .form-switch-custom .slider:before {
        content: "";
        position: absolute;
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background: #fff;
        border-radius: 50%;
        transition: 0.2s;
    }
    .form-switch-custom input:checked + .slider {
        background: #003366;
    }
    .form-switch-custom input:checked + .slider:before {
        transform: translateX(20px);
    }
    @media (max-width: 900px) {
        .medicine-grid { grid-template-columns: repeat(2, 1fr); }
    }
</style>
<?php $__env->stopPush(); ?>

<?php $__env->startSection('content'); ?>
<div class="pharmacy-container">
    <div class="pharmacy-left">
        <div class="pharmacy-search-area">
            <div class="search-row">
                <div class="pharmacy-search-wrap">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text" id="pharmacySearch" placeholder="Search medicine name, generic, barcode...">
                    <div class="search-actions">
                        <button title="Voice Search"><i data-lucide="mic" style="width:16px;height:16px"></i></button>
                        <button title="Scan Barcode"><i data-lucide="scan-barcode" style="width:16px;height:16px"></i></button>
                    </div>
                </div>
                <div class="view-toggle">
                    <button class="active" data-view="grid" title="Grid View"><i data-lucide="layout-grid" style="width:16px;height:16px"></i></button>
                    <button data-view="list" title="List View"><i data-lucide="list" style="width:16px;height:16px"></i></button>
                </div>
            </div>
            <div class="category-scroll" id="categoryScroll">
                <button class="category-btn active" data-category="All">All Medicines</button>
                <button class="category-btn" data-category="Fast Moving"><i data-lucide="flame"></i> Fast Moving</button>
                <button class="category-btn" data-category="Pain Relief"><i data-lucide="pill"></i> Pain Relief</button>
                <button class="category-btn" data-category="Cold/Flu"><i data-lucide="thermometer"></i> Cold/Flu</button>
                <button class="category-btn" data-category="Antibiotics"><i data-lucide="shield-plus"></i> Antibiotics</button>
                <button class="category-btn" data-category="Vitamins"><i data-lucide="pill"></i> Vitamins</button>
                <button class="category-btn" data-category="Chronic"><i data-lucide="heart"></i> Chronic</button>
                <button class="category-btn" data-category="Pediatric"><i data-lucide="baby"></i> Pediatric</button>
            </div>
        </div>
        <div class="medicine-area" id="medicineArea">
        </div>
    </div>

    <div class="pharmacy-right">
        <div class="customer-section">
            <div class="customer-tabs">
                <button class="active" data-tab="walkin">Walk-in</button>
                <button data-tab="regular">Regular</button>
            </div>
            <div class="customer-content">
                <div class="tab-pane active" id="customerWalkin">
                    <div class="walkin-card" style="flex-direction:column;gap:6px;align-items:stretch">
                        <div style="display:flex;align-items:center;gap:8px">
                            <div class="walkin-avatar"><i data-lucide="user" style="width:16px;height:16px"></i></div>
                            <div>
                                <div style="font-weight:600;font-size:12px">Walk-in Customer</div>
                                <div style="font-size:11px;color:#94a3b8">Optional details for receipt</div>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                            <input type="text" id="walkinName" placeholder="Name (optional)" style="padding:5px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:11px;background:#fff">
                            <input type="text" id="walkinPhone" placeholder="Phone (optional)" style="padding:5px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:11px;background:#fff">
                        </div>
                    </div>
                </div>
                <div class="tab-pane" id="customerRegular" style="display:none">
                </div>
            </div>
        </div>

        <div class="cart-header">
            <h3>
                <i data-lucide="shopping-cart" style="width:16px;height:16px"></i>
                Current Bill <span class="item-count" id="cartCount">(0 items)</span>
            </h3>
            <button class="btn-clear-cart" id="btnClearCart" style="display:none">
                <i data-lucide="trash-2" style="width:14px;height:14px"></i> Clear
            </button>
        </div>

        <div class="cart-items" id="cartItems">
            <div class="cart-empty" id="cartEmpty">
                <i data-lucide="shopping-cart"></i>
                <p style="font-weight:500">Cart is empty</p>
                <p class="hint">Select medicines from the left to add them to bill</p>
            </div>
        </div>

        <div class="bill-section">
            <div class="bill-row">
                <span class="label">Subtotal</span>
                <span id="billSubtotal">PKR 0</span>
            </div>
            <div class="bill-row discount" style="align-items:center">
                <span class="label">Discount</span>
                <div style="display:flex;align-items:center;gap:4px">
                    <input type="number" id="discountInput" min="0" max="100" value="0" style="width:40px;padding:2px 4px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;text-align:center">
                    <span style="font-size:11px;color:#94a3b8">%</span>
                    <span class="value" id="billDiscount" style="margin-left:4px;font-size:11px">-</span>
                </div>
            </div>
            <div class="bill-total">
                <span class="total-label">TOTAL</span>
                <span class="total-value" id="billTotal">PKR 0</span>
            </div>

            <div class="payment-methods">
                <button class="pay-method-btn active" data-method="cash">
                    <i data-lucide="banknote"></i>
                    <span>Cash</span>
                </button>
                <button class="pay-method-btn" data-method="credit">
                    <i data-lucide="credit-card"></i>
                    <span>Credit</span>
                </button>
            </div>

            <button class="btn-complete-sale" id="btnCompleteSale" disabled>
                COMPLETE SALE <i data-lucide="arrow-right" style="width:20px;height:20px"></i>
            </button>
        </div>
    </div>
</div>

<div class="modal fade" id="medicineDetailModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:none">
            <div class="modal-header" style="border-bottom:1px solid #f1f5f9;padding:20px 24px">
                <div class="d-flex align-items-start gap-3">
                    <div class="med-icon-box" style="width:56px;height:56px;border-radius:14px">
                        <i data-lucide="pill" style="width:28px;height:28px"></i>
                    </div>
                    <div>
                        <h5 class="modal-title" id="modalMedName" style="font-size:20px;font-weight:700;color:#003366;margin:0"></h5>
                        <p id="modalMedSub" style="font-size:14px;color:#64748b;margin:4px 0 0"></p>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:24px" id="modalMedBody">
            </div>
            <div class="modal-footer" style="border-top:1px solid #f1f5f9;padding:16px 24px">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="modalAddToCart">
                    <i data-lucide="plus" style="width:16px;height:16px"></i> Add to Cart
                </button>
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/pharmacy.js')); ?>?v=<?php echo e(filemtime(public_path('js/pharmacy.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/pharmacy/pos.blade.php ENDPATH**/ ?>