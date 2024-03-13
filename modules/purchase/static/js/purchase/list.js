let tblViewIncome;
let debounceTimer;
let barcodeBuffer = '';

let Purchase = {
    items: {
        provider: "",
        receipt_type: "",
        serie: "",
        number_serie: "",
        date_voucher: "",
        description_purchase: "",
        subtotal: 0.00,
        igv: 0.00,
        total: 0.00,
        products: [],
    },
    calculate_invoice: function () {
        let subtotal = 0.00;
        let igv = $("#id_igv_all").val()
        $.each(this.items.products, function (pos, dict) {
            dict.subtotal = dict.cant * parseFloat(dict.purchase_price)
            subtotal += dict.subtotal;
        })
        this.items.subtotal = subtotal
        this.items.igv = this.items.subtotal * igv
        this.items.total = this.items.subtotal + this.items.igv
        $("#id_subtotal_all").val(this.items.subtotal.toFixed(2));
        $("#id_igv_calc_all").val(this.items.igv.toFixed(2));
        $("#id_total_all").val(this.items.total.toFixed(2));
    },
    list: function () {
        this.calculate_invoice();
        tblViewIncome = new DataTable('#tblViewIncome', {
            pagingType: 'simple_numbers',
            autoWidth: false,
            ordering: false,
            lengthChange: false,
            searching: false,
            paginate: false,
            // scrollX: true,
            destroy: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json',
            },
            data: this.items.products,
            columns: [
                {"data": "name"},
                {"data": "name"},
                {"data": "stock"},
                {"data": "purchase_price"},
                {"data": "cant"},
                {"data": "subtotal"},
                {"data": "sale_price"},
            ],
            columnDefs: [
                {
                    targets: [-7],
                    className: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        let buttons = '<a rel="delete_all" class="btn btn-sm btn-danger remove-list"><i class="fa-regular fa-trash-can"></i></a> ';
                        return buttons;
                    }
                },
                {
                    targets: [-3],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<input type="number" name="cant" class="form-control input-sm" value=' + data + '>';
                    }
                },
                {
                    targets: [-4],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<input type="number" name="purchase_price"  class="input-sm form-control" value=' + data + '>';
                    }
                },
                {
                    targets: [-1],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<input type="number" name="sales_price" class="input-sm form-control" value=' + data + '>';
                    }
                },
                {
                    targets: [-2],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<strong>S/'+ data.toFixed(2) + '</strong>'
                    }
                },
                //
                //
            ],
            rowCallback(row, data, displayNum, displayIndex, dataIndex) {

            },
            initComplete: function (settings, json) {
                // $('body').find('.dataTables_scrollBody').addClass("scrollbar");
            }
        });

        // Acciones con los item de la tabla
        $('#tblViewCash tbody').off()
            .on('click', 'a[rel="view_details"]', function () {
                let info = tblViewCash.row($(this).closest('tr')).data();
                let myModalMovements = $('#myModalMovements');
                myModalMovements.modal('show');

                Cash.lis_movements(info.id);
            });
    },
    lis_movements: function (movement_id) {
        tblViewMovements = new DataTable('#tblViewMovements', {
            ordering: true,
            autoWidth: false,
            // scrollX: true,
            // "sScrollXInner": "100%",
            info: false,
            paging: false,
            destroy: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json',
            },
            ajax: {
                url: window.location.pathname,
                type: 'POST',
                data: {'action': 'list_movements', 'movement_id': movement_id},
                dataSrc: "",
            },
            columns: [
                {"data": "id"},
                {"data": "created_at"},
                {"data": "description"},
                {"data": "cash_type"},
                {"data": "income_amount"},
                {"data": "exit_amount"},

            ],
            columnDefs: [
                {
                    targets: [-1],
                    className: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        if (data !== "-") {
                            return '<strong style="color: red">S/' + data + '</strong>'
                        }
                        return data

                    }
                },
                {
                    targets: [-2],
                    className: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        if (data !== "-") {
                            return '<strong style="color: green">S/' + data + '</strong>'
                        }
                        return data

                    }
                },
                {
                    targets: [-3],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        if (data === "Opening") {
                            return '<span class="badge bg-warning">Aperturado</span>'
                        } else if (data === "Income") {
                            return '<span class="badge bg-success">Ingreso</span>'
                        }
                        return '<span class="badge bg-danger">Salida</span>'


                    }
                },

            ],
            rowCallback(row, data, displayNum, displayIndex, dataIndex) {

            },
            initComplete: function (settings, json) {
                // $('body').find('.dataTables_scrollBody').addClass("scrollbar");
            }
        });


    },
    search_autocomplete: function () {
        $("#id_list_search_ui").autocomplete({
            source: function (request, response) {
                $.ajax({
                    url: window.location.pathname,
                    type: 'POST',
                    data: {'action': 'autocomplete', 'term': request.term},
                    dataType: 'json',
                }).done(function (data) {
                    response(data)
                });
            },
            appendTo: "#myModalIncome",
            delay: 500,
            minLength: 1,
            select: function (event, ui) {
                event.preventDefault();
                console.clear()
                ui.item.cant = 1;
                ui.item.subtotal = 0.00;
                Purchase.items.products.push(ui.item)
                Purchase.list();
                $(this).val('');
            }
        });
    },
    scan_code_product: function (barcode) {
        $.ajax({
            url: window.location.pathname,
            type: 'POST',
            data: {
                'action': 'search_barcode',
                'barcode': barcode,
            },
            success: function (response) {
                if (response.length > 0) {
                    let item = response[0]
                    item.cant = 1;
                    item.subtotal = 0.00;
                    Purchase.items.products.push(item)
                    Purchase.list();
                }
                $("#id_barcode_product_all").val('');
                // tblViewExpense.ajax.reload();
            },
            error: function (error) {
                console.log('AJAX error:', error);
                $("#id_barcode_product_all").val('');
            }
        });
    }
}

$(function () {
    Purchase.list();
    Purchase.search_autocomplete();

    $("#tblViewIncome tbody").off()
        .on('click', 'a[rel="delete_all"]', function () {
            let tr = tblViewIncome.cell($(this).closest('td, li')).index();
            Purchase.items.products.splice(tr.row, 1);
            Purchase.list();
        }).on('change keyup', 'input[name="cant"]', function () {
        let cant = parseInt($(this).val());
        let tr = tblViewIncome.cell($(this).closest('td,li')).index();
        Purchase.items.products[tr.row].cant = cant;
        Purchase.calculate_invoice();
        $('td:eq(5)', tblViewIncome.row(tr.row).node()).html('S/' + Purchase.items.products[tr.row].subtotal.toFixed(2));
    }).on('change keyup', 'input[name="purchase_price"]', function () {
        let purchase_price = parseFloat($(this).val());
        let tr = tblViewIncome.cell($(this).closest('td,li')).index();
        Purchase.items.products[tr.row].purchase_price = purchase_price;
        Purchase.calculate_invoice();
        $('td:eq(5)', tblViewIncome.row(tr.row).node()).html('S/' + Purchase.items.products[tr.row].subtotal.toFixed(2));
    }).on('change keyup', 'input[name="sales_price"]', function () {
        let sale_price = parseFloat($(this).val());
        let tr = tblViewIncome.cell($(this).closest('td,li')).index();
        Purchase.items.products[tr.row].sale_price = sale_price;
    });

    $("#id_barcode_product_all").on("keyup", function (event) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            barcodeBuffer = $("#id_barcode_product_all").val();
            Purchase.scan_code_product(barcodeBuffer);
            barcodeBuffer = '';
        }, 300);

    })

    //  guarda información
    $('#id-send-purchase').on('click', function (e) {
        e.preventDefault();
        if (Purchase.items.products.length === 0) {
            alert("¡Atención! Debe al menos tener un item en su Detalle de Pedido");
            return false;
        }
        // Purchase.items.time_from = $('select[name="time_from"] option:selected').text();
        Purchase.items.provider = $('select[name="provider"]').val();
        Purchase.items.receipt_type = $('select[name="receipt_type"]').val();
        Purchase.items.serie = $('input[name="serie"]').val();
        Purchase.items.number_serie = $('input[name="number_serie"]').val();
        Purchase.items.date_voucher = $('input[name="date_voucher"]').val();
        Purchase.items.description_purchase = $('textarea[name="description_purchase"]').val();

        let parameters = new FormData();
        parameters.append('action', 'add_purchase');
        parameters.append('purchase_details', JSON.stringify(Purchase.items));

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
                            data: parameters,
                            dataType: 'json',
                            processData: false,
                            contentType: false,
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
                                    console.log(result)
                                    window.location.reload();
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