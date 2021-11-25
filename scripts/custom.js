function setError(selector, text) {
    selector.parents(".cart__form-control").find(".cart__form-error").html(text);
    selector.parents(".cart__form-control").addClass("error");
}
function setSuccess(selector) {
    selector.parents(".cart__form-control").find(".cart__form-error").html('');
    selector.parents(".cart__form-control").removeClass("error");
}

function validateEmail(formSelector) {
    var fieldSelector = formSelector.find('[data-form-email]');
    var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
    var isValid = regex.test(String( fieldSelector.val() ).toLowerCase());
    if (!isValid) {
        setError(fieldSelector, "Некорректный E-mail");
    } else {
        setSuccess(fieldSelector);
    }
    return isValid;
}
function validatePhone(formSelector) {
    isValid = true;
    console.log('vp');
    var fieldSelector = formSelector.find('[data-form-phone]');
    var phoneNumber = fieldSelector.val();
    if (phoneNumber.length == 0 ) {
        isValid = false;
        setError(fieldSelector, "Введите номер");
    } else {
        phoneNumber = phoneNumber.replace(/\s+/g, '');
        if (phoneNumber.split('')[0] !== '+') {
            phoneNumber = `+${phoneNumber}`;
        }
        fieldSelector.val(phoneNumber);
        var regex = /(\+375)(\d{2})(\d{6,7}$)/g;
        isValid = regex.test(String(phoneNumber));
        if(!isValid) {
            setError(fieldSelector, "Введите номер в формате +375");
        } else {
            setSuccess(fieldSelector);
        }
    }
    return isValid;
}

$(document).ready(function(){
    $(document).on("click", "#cart-button", function(e){
        e.preventDefault();
        if($(this).data("modalTarget") == "cart") {
            $("body").addClass("scroll-hidden");
            $("#cart").addClass("active");
            $("#overlay").addClass("active").addClass("top-z");
        }
    })

    $(document).on("click", ".cart__button-close", function(e){
        e.preventDefault();
        $("body").removeClass("scroll-hidden");
        $("#cart").removeClass("active");
        $("#overlay").removeClass("active").addClass("top-z");
    })

    $(document).on("click", ".product-counter__group span.product-counter__control", function(e){
        e.preventDefault();
        var cnt = parseInt($("#product-counter").val(), 10);
        if ($(this).hasClass("minus")) {
            cnt = cnt - 1 > 0 ? cnt - 1 : 1;
        }
        if ($(this).hasClass("plus")) {
            cnt++;
        }
        $("#product-counter").val(cnt);
    })

    $(document).on('cart-reloaded.commerce', function(e) {
        console.log('reloaded');
        $("#order_form_wrapper").load(location.href + " #order_form_inner");
        $("#cart_form_wrapper").load(location.href + " #cart_form_inner");
    })

    $(document).on("change", "select[name='sort']", function(e){
        var v = $(this).val();
        $("#catalog__sort input[name='order']").val(v);
        v = v.split("-");
        $("#catalog__sort input[name='sortBy']").val(v[0]);
        $("#catalog__sort input[name='sortOrder']").val(v[1]);
        $("#catalog__sort").submit();
    })

    $(document).on("submit", "#form-cart--", function(e){
        e.preventDefault();
        var a = $(this);
        //console.log('submit');
        var isValidPhone = validatePhone(a);
        var isValidEmail = validateEmail(a);
        if (isValidPhone && isValidEmail) {
            var fd = a.serialize();
            //console.log(fd);
            $.ajax({
                url: "ajax.php",
                data: fd,
                type: "POST",
                cache: false,
                dataType: 'json',
                beforeSend: function () {
                    ;
                },
                success: function (msg) {
                    //console.log(msg);
                    var status = msg.res.status || false;
                    if (status == true) {
                        var redirect = msg.res.output || '';
                        Commerce.reloadCarts();
                        $("#orderPaymentResult").html(redirect);
                        $("#orderPaymentResult").find("form").submit();

                        /*$("#order_form_wrapper").load(location.href + " #order_form_inner");
                        $("#cart_form_wrapper").load(location.href + " #cart_form_inner");
                        a.find('[data-form-phone]').val('');
                        a.find('[data-form-email]').val('');*/
                    }
                }
            })
        }
    })

    $(window).scroll(function () {
        if ($(this).scrollTop() > 10) {
            $(".header").addClass("scrolled");
        } else {
            $(".header").removeClass("scrolled");
        }
    });

    $(document).on("change", ".product_form input[name='product-version']", function(){
        var v = $(this).val();
        var inp = $(this).parents("form").find("input[name='count']");
        if (v <= inp.data("max")) {
            inp.val(v);
            inp.trigger("change");
        }
    })

    $(document).on("click", ".product_form #product-plus", function(e){
        var inp = $(this).parents("form").find("input[name='count']");
        if(inp.data("max") == 0) {
            inp.val(1);
        } else if(inp.val() >= inp.data("max")) {
            inp.val(inp.data("max"));
        } else {

        }
        inp.trigger("change");
    })

    $(document).on("click", ".product_form #product-minus", function(e){
        var inp = $(this).parents("form").find("input[name='count']");
        if(inp.data("max") == 0) {
            inp.val(1);
        } else if(inp.val() <= inp.data("max")) {
            $(this).parents("form").find(".product__controls-buy-button").removeClass("disabled");
            $(this).parents("form").find(".product__controls-buy-button").prop("disabled", "");
        } else {

        }
        inp.trigger("change");
    })

    $(document).on("change", ".product_form input.js-count-field", function(){
        var v = $(this).val();
        var p = $(this).data("price");
        $("#product-price .product_price_value").text( parseFloat(v * p).toFixed(2) );
    })

    $(document).on('cart-update.commerce', function(e, params) {
        var action = params.data.commerceAction || '';
        if(action == 'increase') {
            var inp = $('[data-commerce-cart="' + params.cart.hash + '"] [data-commerce-row="' + params.row + '"]').find("input[name='count']");
            if(inp.val() >= inp.data("max")) {
                return false;
            }
        }
    });

    $(document).on("click", ".product_form .product__controls-buy-button", function(e){
        e.preventDefault();
        var a = $(this);
        var keysCnt = a.parents("form").find("input#product-counter").val();
        if(!$(this).hasClass("disabled")) {
            $.ajax({
                url: "ajax.php",
                data: "action=checkKeys&cnt=" + keysCnt + "&docid=" + a.data("docid"),
                type: "POST",
                cache: false,
                dataType: 'json',
                beforeSend: function () {

                },
                success: function (msg) {
                    var keysAvailable = msg.keysAvailable || 0;
                    if (keysAvailable >= keysCnt) {
                        a.parents("form").find("input#product-counter").data("max", (keysAvailable - keysCnt));
                        a.parents("form").submit();
                        a.parents("form").find("input#product-counter").val(1).trigger("change");
                        if(keysAvailable == keysCnt) {
                            a.attr("disabled", "disabled");
                            a.addClass("disabled");
                        }
                    } else if(keysAvailable == 0) {
                        a.attr("disabled", "disabled");
                        a.addClass("disabled");
                    } else {
                        a.parents("form").find("input#product-counter").val(keysAvailable).trigger("change");
                        a.parents("form").submit();
                        a.parents("form").find("input#product-counter").val(1).trigger("change");
                    }
                }
            });
        }
    })

})