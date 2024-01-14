let tblProduct;
let Car = {
    list: function () {
        tblProduct = new DataTable('#myTable', {
            paging: false,
            responsive: false,
            autoWidth: false,
            destroy: true,
            ordering: false,
            scrollX: true,
            info: false,
            searching: false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json',
            },
            data: [],
            columns: [
                {"data": "id"},
                {"data": "name"},
                {"data": "price"},
                {"data": "cant"},
                {"data": "subtotal"},
            ],
            columnDefs: [
                {
                    targets: [-5],
                    class: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<a rel="remove" class="btn_detele_item_table"><i class="fa-solid fa-trash-can"></i></a>';
                    }
                },

                {
                    targets: [-2],
                    class: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<span class="span-input-cant"><input type="text" value="' + data + '" class="touch-input input-sm" name="cant"></span>';
                    }
                },
            ],
            rowCallback(row, data, displayNum, displayIndex, dataIndex) {
                let tr = $(row).closest('tr');
                tr.find('input[name="cant"]').off('touchspin.on.startdownspin touchspin.on.startupspin')
                    .TouchSpin({
                        min: 1,
                        max: data.stock,
                        step: 1,
                    }).on('touchspin.on.startdownspin', function () {
                    $.ajax({
                        url: window.location.pathname,
                        type: 'POST',
                        data: {
                            'action': 'restar_product',
                            'product_id': data.id
                        },
                        success: function (response) {
                            let dataToAdd = Object.values(response[0].data);
                            $(".session_total").html(response[0].header_data.total)
                            $(".input_total").val(response[0].header_data.total)
                            Car.automatic_calculate_checkout();
                            tblProduct.clear().rows.add(dataToAdd).draw();
                        },
                        error: function (error) {
                            console.log('AJAX error:', error);
                        }
                    });

                }).on('touchspin.on.startupspin', function () {
                    if (parseInt($(this).val()) === data.stock) {
                        const Toast = Swal.mixin({
                            toast: true,
                            position: "top-end",
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                                toast.onmouseenter = Swal.stopTimer;
                                toast.onmouseleave = Swal.resumeTimer;
                            }
                        });
                        Toast.fire({
                            icon: "error",
                            title: "Llegó al limite de su stock " + data.name + " solo tiene " + "<strong>(" + data.stock + ")</strong>",
                        });
                    }
                    $.ajax({
                        url: window.location.pathname,
                        type: 'POST',
                        data: {
                            'action': 'add_product',
                            'product_id': data.id
                        },
                        success: function (response) {
                            let dataToAdd = Object.values(response[0].data);
                            $(".session_total").html(response[0].header_data.total)
                            $(".input_total").val(response[0].header_data.total)
                            Car.automatic_calculate_checkout();
                            tblProduct.clear().rows.add(dataToAdd).draw();
                        },
                        error: function (error) {
                            console.log('AJAX error:', error);
                        }
                    });


                })

            },
            initComplete: function (settings, json) {
                // $('body').find('.dataTables_scrollBody').addClass("scrollbar");
            }
        });
    },
    click_action_product: function () {
        $('.click_action').click(function () {
            let productId = $(this).data('product-id');
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'add_product',
                    'product_id': productId
                },
                success: function (response) {
                    let dataToAdd = Object.values(response[0].data);
                    console.log(dataToAdd)
                    dataToAdd.forEach(function (v, k) {
                        if (v.id === productId) {
                            if (v.cant === v.stock) {
                                const Toast = Swal.mixin({
                                    toast: true,
                                    position: "top-end",
                                    showConfirmButton: false,
                                    timer: 3000,
                                    timerProgressBar: true,
                                    didOpen: (toast) => {
                                        toast.onmouseenter = Swal.stopTimer;
                                        toast.onmouseleave = Swal.resumeTimer;
                                    }
                                });
                                Toast.fire({
                                    icon: "error",
                                    title: "Llegó al limite de su stock " + v.name + "solo tiene " + "<strong>(" + v.stock + ")</strong>",
                                });
                            }
                        }
                    })
                    $(".session_total").html(response[0].header_data.total)
                    $(".input_total").val(response[0].header_data.total)

                    tblProduct.clear().rows.add(dataToAdd).draw();
                    Car.automatic_calculate_checkout();
                },
                error: function (error) {
                    console.log('AJAX error:', error);
                }
            });
        });
    },
    click_action_category: function () {
        $('.click_action_category').click(function () {
            let categoryId = $(this).data('category-id');
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'search_category_product',
                    'category_id': categoryId
                },
                success: function (response) {
                    let content = "";
                    response.forEach(function (val, key) {
                        content += '<div class="producto-item click_action" data-product-id="' + val.id + '">' +
                            '<div class="content-img-product">' +
                            '<div class="img-product-stock">' + val.stock + '</div>' +
                            '<div class="img-product-price">S/ ' + val.sale_price + '</div>' +
                            '<img src="' + val.image + '" alt="">' +
                            '<div class="img-product-name">' +
                            '<b>' + val.name + '</b>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                    })
                    $(".grid-product-list").html(content)
                    Car.click_action_product();

                },
                error: function (error) {
                    console.log('AJAX error:', error);
                }
            });
        });
    },
    click_action_category_all: function () {
        $('.click_action_category_all').click(function () {
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'search_category_product_all',
                },
                success: function (response) {
                    let content = "";
                    response.forEach(function (val, key) {
                        content += '<div class="producto-item click_action" data-product-id="' + val.id + '">' +
                            '<div class="content-img-product">' +
                            '<div class="img-product-stock">' + val.stock + '</div>' +
                            '<div class="img-product-price">S/ ' + val.sale_price + '</div>' +
                            '<img src="' + val.image + '" alt="">' +
                            '<div class="img-product-name">' +
                            '<b>' + val.name + '</b>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                    })
                    $(".grid-product-list").html(content)
                    Car.click_action_product();
                },
                error: function (error) {
                    console.log('AJAX error:', error);
                }
            });
        });
    },
    search_product: function () {
        $("#id_search_product").on("keyup", function () {
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'search_product',
                    'search_name': $(this).val(),
                },
                success: function (response) {
                    let content = "";
                    response.forEach(function (val, key) {
                        content += '<div class="producto-item click_action" data-product-id="' + val.id + '">' +
                            '<div class="content-img-product">' +
                            '<div class="img-product-stock">' + val.stock + '</div>' +
                            '<div class="img-product-price">S/ ' + val.sale_price + '</div>' +
                            '<img src="' + val.image + '" alt="">' +
                            '<div class="img-product-name">' +
                            '<b>' + val.name + '</b>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                    })
                    $(".grid-product-list").html(content)
                    Car.click_action_product();

                },
                error: function (error) {
                    console.log('AJAX error:', error);
                }
            });
        })
    },
    calculate_checkout: function () {
        $(".input_pyment").on("keyup", function () {
            let total = $(".input_total").val();
            let pyment = $(this).val();
            let vuel = $(".input_vuelto");
            let vuelto = pyment === "" ? 0.00 : pyment - total
            if (vuelto < 0) {
                vuel.css("border", "2px solid red");
                vuel.css("background", "#ffd8d8");
            } else {
                vuel.css("border", "2px solid green");
                vuel.css("background", "#c9ffc9");

            }
            vuel.val(parseFloat(vuelto).toFixed(2))
        })
    },
    automatic_calculate_checkout: function () {
        let total = $(".input_total").val();
        let pyment = $(".input_pyment").val();
        let vuel = $(".input_vuelto");
        let vuelto = pyment === "" ? 0.00 : pyment - total
        console.log(vuelto)
        if (vuelto < 0) {
            vuel.css("border", "2px solid red");
            vuel.css("background", "#ffd8d8");
        } else {
            vuel.css("border", "2px solid green");
            vuel.css("background", "#c9ffc9");
        }
        vuel.val(parseFloat(vuelto).toFixed(2))

    }
}
$(function () {
    Car.list()
    Car.click_action_product();
    Car.click_action_category();
    Car.click_action_category_all();
    Car.search_product();
    Car.calculate_checkout();

    $('#myTable tbody').off()
        // Eliminar
        .on('click', 'a[rel="remove"]', function () {
            let tr = tblProduct.cell($(this).closest('td, li')).index();
            let data = tblProduct.row(tr['row']).data();
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'revome_item_product',
                    'product_id': data.id
                },
                success: function (response) {
                    let dataToAdd = Object.values(response[0].data);
                    $(".session_total").html(response[0].header_data.total)
                    $(".input_total").val(response[0].header_data.total)
                    tblProduct.clear().rows.add(dataToAdd).draw();
                    Car.automatic_calculate_checkout();
                },
                error: function (error) {
                    console.log('AJAX error:', error);
                }
            });

        })
})
