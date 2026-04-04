/*----------------------------------------------------------------

	explorills - community governed ecosystem

	-------------------------------------------------------------------------------*/

/**************************************************************
	
	Main Js Activation
	01. Preloader
	02. Menu
	03. Header Shadow 
	04. FullPage
	05. Carousels
	06. Forms
	__ End Js Activation

***************************************************************/

(function ($) {
	'use strict';

	/*-------------------------------------------------------------------------------
	  Preloader
	-------------------------------------------------------------------------------*/

	$(window).on('load', function () {
		if ($('.preloader').length) {
			$('.preloader').fadeOut('slow');
		}
	});

	/*-------------------------------------------------------------------------------
	  Menu
	-------------------------------------------------------------------------------*/

	$('.a-nav-toggle, .menu-main a').on('click', function () {
		if ($('html').hasClass('body-menu-opened')) {
			$('html').removeClass('body-menu-opened').addClass('body-menu-close');
		} else {
			$('html').addClass('body-menu-opened').removeClass('body-menu-close');
		}
	});

	/*-------------------------------------------------------------------------------
	  Header Shadow
	-------------------------------------------------------------------------------*/

	// $('.section').on('scroll', function () {
	// 	if ($(this).scrollTop() > 0) {
	// 		$('.header').addClass('header-shadow');
	// 	} else {
	// 		$('.header').removeClass('header-shadow');
	// 	}
	// });

	/*-------------------------------------------------------------------------------
	Fullpage
	-------------------------------------------------------------------------------*/

	new fullpage('#fullpage', {
		licenseKey: 'M36M9-7Q74I-R83I9-91OM9-VZLYQ',
		navigation: true,
		navigationPosition: 'right',
		loopTop: true,
		loopBottom: true,
		anchors: ['EXPL-Nodes', 'Blue-Minerals', 'TNO-Bronze', 'TNO-Silver', 'TNO-Gold', 'TNO-Diamond'],
		menu: '#menu, #menuMain',
		scrollingSpeed: 1200,
		touchSensitivity: 6,
		fadingEffect: true,
		fadingEffectKey: 'UW5aWGh3Ykc5eWFXeHNjeTVqYjIwPXRyXzlHNFptRmthVzVuUldabVpXTjBqanA=',
		scrollOverflow: true,
		scrollOverflowReset: true,
		scrollOverflowResetKey: 'cFlaWGh3Ykc5eWFXeHNjeTVqYjIwPTRHX0dZcmMyTnliMnhzVDNabGNtWnNiM2RTWlhObGRBPT1wNzg=',
		credits: { enabled: false },

	});

	/*-------------------------------------------------------------------------------
	  Carousels
	-------------------------------------------------------------------------------*/

	if ($('.a-carousel-projects').length) {
		$('.a-carousel-projects').owlCarousel({
			animateIn: 'fadeIn',
			animateOut: 'fadeOut',
			items: 1,
			navText: ['<i class="lni lni-chevron-left"></i>', '<i class="lni lni-chevron-right"></i>'],
			smartSpeed: 750,
			dots: false,
			nav: true,
			loop: true,
			touchDrag: false,
			mouseDrag: false
		});
	}

	if ($('.a-carousel-experience').length) {
		$('.a-carousel-experience').owlCarousel({
			items: 1,
			navText: ['<i class="lni lni-chevron-left"></i>', '<i class="lni lni-chevron-right"></i>'],
			smartSpeed: 750,
			margin: 30,
			dots: false,
			nav: true,
			navContainer: '.a-carousel-nav',
			loop: true,
			touchDrag: false,
			mouseDrag: false
		});
	}

	if ($('.a-carousel-testimonial').length) {
		$('.a-carousel-testimonial').owlCarousel({
			items: 1,
			navText: ['<i class="lni lni-chevron-left"></i>', '<i class="lni lni-chevron-right"></i>'],
			smartSpeed: 750,
			margin: 30,
			dots: false,
			nav: true
		});
	}

	/*-------------------------------------------------------------------------------
	  Forms
	-------------------------------------------------------------------------------*/

	// File Input Path
	$(document).on('change', '.a-file input[type="file"]', function () {
		var file_field = $(this).closest('.a-file');
		var path_input = file_field.find('input.file-path');
		var files = $(this)[0].files;
		var file_names = [];
		for (var i = 0; i < files.length; i++) {
			file_names.push(files[i].name);
		}
		path_input.val(file_names.join(", "));
		path_input.trigger('change');
	});

	// Material
	if ($('.a-form-group').length) {
		$('.a-form-group .form-control').each(function () {
			if ($(this).val().length > 0 || $(this).attr('placeholder') !== undefined) {
				$(this).closest('.a-form-group').addClass('active');
			}
		});
		$('.a-form-group .form-control').focus(function () {
			$(this).closest('.a-form-group').addClass('active');
		});
		$('.a-form-group .form-control').blur(function () {
			if ($(this).val() == '' && $(this).attr('placeholder') == undefined) {
				$(this).closest('.a-form-group').removeClass('active');
			}
		});
		$('.a-form-group .form-control').change(function () {
			if ($(this).val() == '' && $(this).attr('placeholder') == undefined) {
				$(this).closest('.a-form-group').removeClass('active');
			} else {
				$(this).closest('.a-form-group').addClass('active');
			}
		});
	}

	// Send Form
	if ($('.a-ajax-form').length) {
		$('.a-ajax-form').each(function () {
			var thisForm = $(this);
			var succMessage = thisForm.find('.success-message');
			var errMessage = thisForm.find('.error-message');
			thisForm.validate({
				errorClass: 'error',
				submitHandler: function (form) {
					$.ajax({
						type: 'POST',
						url: 'handler.php',
						data: new FormData(form),
						cache: false,
						contentType: false,
						processData: false,
						success: function () {
							succMessage.show();
						},
						error: function () {
							errMessage.show();
						}
					});
				}
			});
		});
	}

}($));

/* Hide fullPage.js license warning - TEMPORARY FIX */
(function() {
	function removeLicenseWarning() {
		var elements = document.querySelectorAll('div[style*="z-index:9999999"], div[style*="background:red"]');
		elements.forEach(function(el) {
			if (el.innerHTML && el.innerHTML.indexOf('Unlicensed') !== -1) {
				el.remove();
			}
		});
		// Also check for any element containing the warning link
		var links = document.querySelectorAll('a[href*="alvarotrigo.com/fullPage"]');
		links.forEach(function(link) {
			if (link.parentElement) {
				link.parentElement.remove();
			}
		});
	}
	// Run immediately and after delays to catch dynamically added elements
	document.addEventListener('DOMContentLoaded', removeLicenseWarning);
	setTimeout(removeLicenseWarning, 100);
	setTimeout(removeLicenseWarning, 500);
	setTimeout(removeLicenseWarning, 1000);
	setTimeout(removeLicenseWarning, 2000);
	// Also observe for dynamically added elements
	var observer = new MutationObserver(removeLicenseWarning);
	observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
})();

function afterConnect(){
	document.getElementById('connect').style.display = 'none';
	document.getElementById('mint-btn').style.display = 'none';
	document.getElementById('new-container').style.display = 'flex';
}