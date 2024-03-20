let tblProduct;
let debounceTimer2;
let barcodeBuffer2 = '';
let total_difference = 0
let Car = {
    // ---- inicializamos dataTable
    list: function () {
        tblProduct = new DataTable('#myTable', {
            paging: false,
            responsive: false,
            autoWidth: false,
            destroy: true,
            ordering: true,
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
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<a rel="remove" class="btn_detele_item_table"><i class="fa-solid fa-trash-can"></i></a>';
                    }
                },

                {
                    targets: [-2],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<span class="span-input-cant"><input type="text" id="id_input_can" value="' + data + '" class="touch-input input-sm" name="cant"></span>';
                    }
                },
            ],
            rowCallback(row, data, displayNum, displayIndex, dataIndex) {
                let tr = $(row).closest('tr');
                let stock = Number.isInteger(parseFloat(data.stock)) ? parseFloat(data.stock).toFixed(0) : parseFloat(data.stock).toFixed(4)

                let config_kilo = {
                    min: 0,
                    max: data.stock,
                    step: 1,
                    decimals: 4,
                    maxboostedstep: 10,
                    forcestepdivisibility: 'none',
                }
                let configs = {
                    min: 1,
                    max: stock,
                    step: 1,
                }
                tr.find('input[name="cant"]').off('touchspin.on.startdownspin touchspin.on.startupspin')
                    .TouchSpin(data.kilo === 'true' ? config_kilo : configs).on('touchspin.on.startdownspin', function () {
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
                    if ($(this).val() === data.stock) {
                        alert_stock(data.name, stock);
                    }
                    $.ajax({
                        url: window.location.pathname,
                        type: 'POST',
                        data: {
                            'action': 'add_product',
                            'product_id': data.id
                        },
                        success: function (response) {
                            let dataToAdd = response[0].data;
                            $(".session_total").html(response[0].header_data.total)
                            $(".input_total").val(response[0].header_data.total)
                            Car.automatic_calculate_checkout();
                            tblProduct.clear().rows.add(dataToAdd).draw();
                        },
                        error: function (error) {
                            console.log('AJAX error:', error);
                        }
                    });

                }).on("change keyup", function () {
                    let val_input = $(this).val() === "" ? 1 : $(this).val();
                    if (parseFloat(val_input) >= parseFloat(data.stock)) {
                        alert_stock(data.name, stock);
                    }
                    $.ajax({
                        url: window.location.pathname,
                        type: 'POST',
                        data: {
                            'action': 'add_product',
                            'product_id': data.id,
                            'cant': parseFloat(val_input) >= parseFloat(data.stock) ? parseFloat(data.stock) : parseFloat(val_input)
                        },
                        success: function (response) {
                            let dataToAdd = Object.values(response[0].data);
                            $(".session_total").html(response[0].header_data.total)
                            $(".input_total").val(response[0].header_data.total)
                            Car.automatic_calculate_checkout();
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
        Car.click_action_product();
        Car.click_action_category();
        Car.click_action_category_all();
        Car.search_product();
        Car.calculate_checkout();


    },
    action_item_dataTable: function () {
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
    },
    // ---- apertura de caja
    valid_box_opening: async function () {
        if (box_opening === false) {
            const {value: formValues} = await Swal.fire({
                html: '<h3>Para inciar la Venta tiene que  Aperturar la Caja del día</h3>' +
                    '<h6>' + new Date().toString() + '</h6>' +
                    '<input type="text" id="id_swal_amout" class="swal2-input" value="0.00" placeholder="Ingresa un monto"> ' +
                    '<textarea id="id_swal_description" class="swal2-input" placeholder="Puedes detallar la apertura..."></textarea> <br>',
                focusConfirm: false,
                icon: 'warning',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                confirmButtonColor: "#343338",
                confirmButtonText: "Aperturar Caja",
                preConfirm: () => {
                    let amount = $("#id_swal_amout").val();
                    if (amount === "" || amount <= 0) {
                        return Swal.showValidationMessage("Ingresa un monto mayor a 0");
                    }
                }

            });
            if (formValues) {
                let amount = document.getElementById("id_swal_amout").value
                let description = document.getElementById("id_swal_description").value
                $.ajax({
                    url: window.location.pathname,
                    type: 'POST',
                    data: {
                        'action': 'add_box_opening',
                        'json_box': JSON.stringify({'amount': amount, 'description': description})
                    },
                    success: function (response) {
                        Swal.fire({
                            title: "Apertura de Caja",
                            text: "La caja ha sido abierta correctamente para el día de hoy. ¡No olvides cerrarla al final del día!",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 3500
                        });
                    },
                    error: function (error) {
                        console.log('AJAX error:', error);
                    }
                });
            }
        }
    },
    // ---- acción para agregar productos
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
                    let dataToAdd = response[0].data;
                    dataToAdd.forEach(function (v, k) {
                        let stock = Number.isInteger(parseFloat(v.stock)) ? parseFloat(v.stock).toFixed(0) : parseFloat(v.stock).toFixed(4)
                        if (v.id === productId) {
                            if (v.stock === 0) {
                                alert_stock(v.name, stock);
                                return false;
                            }
                            if (v.cant >= parseFloat(v.stock)) {
                                alert_stock(v.name, stock);
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
                data: {'action': 'search_category_product', 'category_id': categoryId},
                success: function (response) {
                    let content = "";
                    response.forEach(function (val, key) {
                        let stock = Number.isInteger(parseFloat(val.stock)) ? parseFloat(val.stock).toFixed(0) : parseFloat(val.stock).toFixed(4);
                        content += '<div class="producto-item click_action" data-product-id="' + val.id + '">' +
                            '<div class="content-img-product">' +
                            '<div class="img-product-stock">' + stock + '</div>' +
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
    filter_product_all: function () {
        $.ajax({
            url: window.location.pathname,
            type: 'POST',
            data: {'action': 'search_category_product_all'},
            success: function (response) {
                let content = "";
                response.forEach(function (val, key) {
                    let stock = Number.isInteger(parseFloat(val.stock)) ? parseFloat(val.stock).toFixed(0) : parseFloat(val.stock).toFixed(4);

                    content += '<div class="producto-item click_action" data-product-id="' + val.id + '">' +
                        '<div class="content-img-product">' +
                        '<div class="img-product-stock">' + stock + '</div>' +
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
    },
    click_action_category_all: function () {
        $('.click_action_category_all').click(function () {
            Car.filter_product_all();
        });
    },
    // ---- busqueda de productos
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
    // ---- cálculo para el vuelto
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
        if (vuelto < 0) {
            vuel.css("border", "2px solid red");
            vuel.css("background", "#ffd8d8");
        } else {
            vuel.css("border", "2px solid green");
            vuel.css("background", "#c9ffc9");
        }
        vuel.val(parseFloat(vuelto).toFixed(2))

    },
    click_action_type_pyment: function () {
        $('.click_action_type_pyment').click(function () {
            $('.click_action_type_pyment').css('border-bottom', 'none');
            let typePyment = $(this).data('type-pyment');
            $(this).css('border-bottom', '2px solid #fff');
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'add_type_pyment',
                    'type_pyment': typePyment
                },
                success: function (response) {
                    console.log(response)
                },
                error: function (error) {
                    console.log('AJAX error:', error);
                }
            });
        });

    },
    scan_code_product: function (barcode) {
        $.ajax({
            url: window.location.pathname,
            type: 'POST',
            data: {
                'action': 'search_barcode_add_product',
                'barcode': barcode
            },
            success: function (response) {
                console.log(response)

                if (response.length > 0) {
                    let response_data = response[0].data;
                    let response_id = response[0].id_product;

                    if (response[0].data === 'stock') {
                        let stock = Number.isInteger(parseFloat(response[0].stocks)) ? parseFloat(response[0].stocks).toFixed(0) : parseFloat(response[0].stocks).toFixed(4)
                        alert_stock(response[0].name, stock);
                        $("#id_search_product-barcode").val('');
                        return false;
                    }

                    if (parseFloat(response_data[response_id].cant).toFixed(4) >= parseFloat(response_data[response_id].stock)) {
                        let stock = Number.isInteger(parseFloat(response_data[response_id].stock)) ? parseFloat(response_data[response_id].stock).toFixed(0) : parseFloat(response_data[response_id].stock).toFixed(4)
                        console.log("entro")
                        alert_stock(response_data[response_id].name, stock);
                    }

                    let dataToAdd = Object.values(response[0].data);

                    $(".session_total").html(response[0].header_data.total)
                    $(".input_total").val(response[0].header_data.total)

                    tblProduct.clear().rows.add(dataToAdd).draw();
                    Car.automatic_calculate_checkout();
                }
                $("#id_search_product-barcode").val('');
            },
            error: function (error) {
                console.log('AJAX error:', error);
            }
        });
    }
}
$(function () {
    Car.valid_box_opening();
    $('#id_swal_amout').on('input', function () {
        $(this).val(function (_, value) {
            return value.replace(/[^0-9.]/g, '');
        });
        if ($(this).val().indexOf('.') !== $(this).val().lastIndexOf('.')) {
            $(this).val(function (_, value) {
                return value.slice(0, -1);
            });
        }
    });
    Car.list();
    Car.action_item_dataTable();
    Car.click_action_type_pyment();

    $("#myTable tbody").on('change keyup', 'input[name="cant"]', function () {
        let cant_input = $(this).val() === '' || $(this).val() === '0' ? 0.01 : parseFloat($(this).val());
        let tr = tblProduct.cell($(this).closest('td,li')).index();
        let data = tblProduct.row(tr.row).data()

        if (cant_input >= data.stock) {
            cant_input = data.stock
            $(this).val(data.stock)
        }
        let calc = data.price * cant_input
        $('td:eq(4)', tblProduct.row(tr.row).node()).html(calc.toFixed(2));

    })

    $("#id_btn_pyment").click(function () {
        let pyment = $("input[name='pyment']").val();
        let vuelto = $("input[name='vuelto']").val();
        $.confirm({
            boxWidth: '35%',
            useBootstrap: false,
            theme: 'material',
            title: 'Confirmación!',
            icon: 'fa fa-info',
            // type: 'green',
            content: 'Estas Seguro de Realizar la siguiente acción!',
            columnClass: 'small',
            typeAnimated: true,
            confirmButtonClass: 'btn-confirm-primary',
            cancelButtonClass: 'btn-primary',
            draggable: true,
            dragWindowBorder: false,
            buttons: {
                info: {
                    text: 'Si',
                    btnClass: 'btn-primary',
                    action: function () {
                        $.ajax({
                            url: window.location.pathname,
                            type: 'POST',
                            data: {
                                'action': 'add_sale',
                                'pyment': pyment,
                                'vuelto': vuelto
                            },
                        }).done(function (data) {
                            console.log(data);
                            if (!data.hasOwnProperty('Error')) {
                                Swal.fire({
                                    title: '¡Operación Exitoso!',
                                    icon: 'success',
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    allowEnterKey: false,
                                    text: 'Usted ha registrado correctamente!',
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'OK'
                                }).then((result) => {
                                    if (result.value) {
                                        Car.filter_product_all();

                                        tblProduct.clear().rows.add([]).draw();
                                        Car.automatic_calculate_checkout();
                                        $(".session_total").html("0.00");
                                        $("input[name='total']").val("0.00");
                                        $("input[name='pyment']").val("");
                                        $("input[name='vuelto']").val("0.00");
                                    }
                                })
                                return false;
                            }
                            alert(data.Error);
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            alert(textStatus + ':' + errorThrown)
                        }).always(function (data) {
                            console.log(data)
                        });

                    }
                },
                danger: {
                    text: 'No',
                    btnClass: 'btn-red',
                    action: function () {

                    }
                },
            }
        });
    });

    $("#id_search_product-barcode").on("keyup", function (event) {
        clearTimeout(debounceTimer2);
        debounceTimer2 = setTimeout(function () {
            barcodeBuffer2 = $("#id_search_product-barcode").val();
            Car.scan_code_product(barcodeBuffer2);
            barcodeBuffer2 = '';
        }, 300);

    });

    // mostrar datos de cierre de caja
    $("#id_btn_closingcash").on("click", function () {
        $.ajax({
            url: window.location.pathname,
            type: 'POST',
            data: {'action': 'closing_cash',}
        }).done(function (data) {
            console.log(data);
            if (!data.hasOwnProperty('Error')) {
                let content_cash = '<h6 class="fs-15 mb-2 fw-semibold">Usuario : <span class="fw-normal">' + data.user + '</span></h6>' +
                    '<h6 class="fs-15 mb-2 fw-semibold">Estado : <span class="fw-normal"> <div class="badge bg-success-subtle text-success fs-11">' + data.status + '</div></span></h6>' +
                    '<h6 class="fs-15 mb-2 fw-semibold">Saldo Apertura : <span class="fw-normal">S/ ' + data.opening_total.toFixed(2) + '</span></h6>' +
                    '<h6 class="fs-15 mb-2 fw-semibold">Salida : <span class="fw-normal">S/ ' + data.exit_total.toFixed(2) + '</span></h6>' +
                    '<h6 class="fs-15 mb-2 fw-semibold">Ingreso : <span class="fw-normal">S/ ' + data.income_total.toFixed(2) + '</span></h6>' +
                    '<h6 class="fs-15 mb-2 fw-semibold">Ganancias Neta : <span class="fw-normal">S/ ' + data.total_earnings.toFixed(2) + '</span></h6>' +
                    '<h6 class="fs-15 mb-2 fw-semibold">Total en caja : <span class="fw-normal">S/ ' + data.total_cash.toFixed(2) + '</span></h6>'
                $(".content-cash").html(content_cash);

                $("#input-real").on("change, keyup", function () {
                    total_difference = data.total_cash - $(this).val();
                    $(".price-diferents").html('S/ ' + total_difference.toFixed(2))
                });

                return false;
            }
            alert(data.Error);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + ':' + errorThrown)
        }).always(function (data) {

        });
    });

    // Envio de datos para cerrar caja
    $("#id-send-closing_cash").on("click", function () {
        let real_amount = $("#input-real").val();

        $.confirm({
            boxWidth: '35%',
            useBootstrap: false,
            theme: 'material',
            title: 'Confirmación!',
            icon: 'fa fa-info',
            // type: 'green',
            content: 'Estas Seguro de Realizar la siguiente acción!',
            columnClass: 'small',
            typeAnimated: true,
            confirmButtonClass: 'btn-confirm-primary',
            cancelButtonClass: 'btn-primary',
            draggable: true,
            dragWindowBorder: false,
            buttons: {
                info: {
                    text: 'Si',
                    btnClass: 'btn-primary',
                    action: function () {
                        $.ajax({
                            url: window.location.pathname,
                            type: 'POST',
                            data: {
                                'action': 'add_closing_cash',
                                'real_amount': real_amount,
                                'total_difference': total_difference
                            }
                        }).done(function (data) {
                            console.log(data);
                            if (!data.hasOwnProperty('Error')) {
                                window.location.reload();
                                return false;
                            }
                            alert(data.Error);
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            alert(textStatus + ':' + errorThrown)
                        }).always(function (data) {

                        });

                    }
                },
                danger: {
                    text: 'No',
                    btnClass: 'btn-red',
                    action: function () {

                    }
                },
            }
        });


    });


});