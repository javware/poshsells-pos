let tblProduct;
let Car = {
    // ---- inicializamos dataTable
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
                    let dataToAdd = Object.values(response[0].data);
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

    $("#id_btn_pyment").click(function () {
        let pyment = $("input[name='pyment']").val();
        let vuelto = $("input[name='vuelto']").val();
        $.confirm({
            boxWidth: '35%',
            useBootstrap: false,
            theme: 'material',
            title: 'Confirmación!',
            icon: 'fa fa-info',
            // type:'red',
            content: 'Estas Seguro de Realizar la siguiente acción!',
            columnClass: 'small',
            typeAnimated: true,
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

                                        tblProduct.clear().rows.add([]).draw();
                                        Car.automatic_calculate_checkout();
                                        $(".session_total").html("0.00")
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
});