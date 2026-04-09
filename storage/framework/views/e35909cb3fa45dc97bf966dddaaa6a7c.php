<?php
    $hnName      = \App\Models\HospitalSetting::getValue('basic_name', 'Nova HMS');
    $hnShortName = \App\Models\HospitalSetting::getValue('basic_short_name', '');
?>
<header class="topnav">

    
    <div style="flex:1;min-width:0"></div>

    
    <div style="flex:0 0 620px;max-width:620px;padding:0 12px">
        <div style="position:relative">
            <i data-lucide="search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:rgba(255,255,255,0.4);pointer-events:none"></i>
            <input type="text" id="globalSearch" placeholder="Search pages and tabs..." autocomplete="off"
                style="width:100%;background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,0.14);border-radius:10px;padding:8px 12px 8px 36px;font-size:13px;color:#fff;outline:none;transition:all 0.2s"
                onfocus="this.style.background='rgba(255,255,255,0.14)';this.style.borderColor='rgba(127,255,212,0.45)'"
                onblur="this.style.background='rgba(255,255,255,0.09)';this.style.borderColor='rgba(255,255,255,0.14)'">
            <div id="globalSearchResults"></div>
        </div>
    </div>

    
    <div style="flex:1;min-width:0;text-align:right;padding-left:16px">
        <div id="topnavHospitalName" style="font-size:13px;font-weight:600;color:#fff;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><?php echo e($hnName); ?></div>
        <?php if($hnShortName): ?>
        <div id="topnavHospitalShortName" style="font-size:11px;color:rgba(255,255,255,0.5);line-height:1.2;white-space:nowrap"><?php echo e($hnShortName); ?></div>
        <?php else: ?>
        <div id="topnavHospitalShortName" style="display:none"></div>
        <?php endif; ?>
    </div>

</header>
<?php /**PATH C:\xampp\htdocs\makosh\resources\views/partials/topnav.blade.php ENDPATH**/ ?>