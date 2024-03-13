let tblViewCash;
let tblViewMovements;
let tblViewExpense;

let Cash = {
    list: function () {
        tblViewCash = new DataTable('#tblViewCash', {
            ordering: false,
            pagingType: 'simple_numbers',
            autoWidth: false,
            // scrollX: true,
            destroy: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json',
            },
            ajax: {
                url: window.location.pathname,
                type: 'POST',
                data: {'action': 'list_cash'},
                dataSrc: "",
                // headers: {'X-CSRFToken': csrftoken},
            },
            columns: [
                {"data": "id"},
                {"data": "user"},
                {"data": "opening_date"},
                {"data": "opening_amount"},
                {"data": "closing_date"},
                {"data": "closing_amount"},
                {"data": "leftover_amount"},
                {"data": "missing_amount"},
                {"data": "cash_amount"},
                {"data": "status"},
                {"data": "id"},
            ],
            columnDefs: [
                {
                    targets: [-1],
                    className: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        let buttons = '<a rel="view_details" class="btn btn-sm btn-info remove-list"><i class="fa-regular fa-eye"></i></a> ';
                        return buttons;
                    }
                },
                {
                    targets: [-2],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        if (data === "Opened") {
                            return '<span class="badge bg-success">Aperturado</span>'
                        }
                        return '<span class="badge bg-danger">Cerrado</span>'


                    }
                },
                {
                    targets: [-10],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return data.first_name + " " + data.last_name;
                    }
                },


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
                {"data": "type_operation"},
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
                {
                    targets: [-4],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        if (data === "Opening") {
                            return '<span class=" ">Apertura de Caja</span>'
                        } else if (data === "Sale") {
                            return '<span class=" ">Venta</span>'
                        } else if (data === "Purchase") {
                            return '<span class=" ">Compra</span>'
                        } else if (data === "Expense") {
                            return '<span class=" ">Gasto</span>'
                        } else if (data === "Income") {
                            return '<span class=" ">Ingreso</span>'
                        } else if (data === "Adjustment") {
                            return '<span class=" ">Ajuste Personal</span>'
                        }
                        return '<span class=" ">Cierre de Caja</span>'


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
    add_expense: function () {
        $("#btn_save_expense").on("click", function () {
            let expense_type = $("#id_expense_type");
            let amount = $("#id_amount");
            let description = $("#id_description");
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': 'add_expense',
                    'expense_type': expense_type.val(),
                    'amount': amount.val(),
                    'description': description.val()
                },
                success: function (response) {
                    console.log(response);
                    tblViewExpense.ajax.reload();
                },
                error: function (error) {
                    console.log('AJAX error:', error);
                }
            });


        })
    },
    lis_expense: function () {
        tblViewExpense = new DataTable('#tblViewExpense', {
            ordering: false,
            autoWidth: true,
            info: false,
            paging: true,
            pagingType: 'simple_numbers',
            destroy: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json',
            },
            ajax: {
                url: window.location.pathname,
                type: 'POST',
                data: {'action': 'list_expense'},
                dataSrc: "",
            },
            columns: [
                {"data": "created_at"},
                {"data": "expense_type.name"},
                {"data": "description"},
                {"data": "amount"},
            ],
            columnDefs: [
                {
                    targets: [-1],
                    className: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<strong>S/' + data + '</strong>'
                    }
                },
                {
                    targets: [-4],
                    className: 'text-center',
                },
                // {
                //     targets: [-3],
                //     class: 'text-center',
                //     orderable: true,
                //     render: function (data, type, row) {
                //         if (data === "Opening") {
                //             return '<span class="badge bg-warning">Aperturado</span>'
                //         } else if (data == "Income") {
                //             return '<span class="badge bg-success">Ingreso</span>'
                //         }
                //         return '<span class="badge bg-danger">Salida</span>'
                //
                //
                //     }
                // },
                // {
                //     targets: [-10],
                //     class: 'text-center',
                //     orderable: true,
                //     render: function (data, type, row) {
                //         return data.first_name + " " + data.last_name;
                //     }
                // },


            ],
            rowCallback(row, data, displayNum, displayIndex, dataIndex) {

            },
            initComplete: function (settings, json) {
                // $('body').find('.dataTables_scrollBody').addClass("scrollbar");
            }
        });
    },

}

$(function () {
    Cash.list();
    Cash.add_expense();
    $("#id_btn_expense").on("click", function () {
        Cash.lis_expense();
    })
});