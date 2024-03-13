let tblViewSale;
let tblViewSalesDetails;


let Sale = {
    list: function () {
        tblViewSale = new DataTable('#tblViewSale', {
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
                data: {'action': 'list_sale'},
                dataSrc: "",
                // headers: {'X-CSRFToken': csrftoken},
            },
            columns: [
                {"data": "id"},
                {"data": "employee"},
                {"data": "payment_method"},
                {"data": "cash"},
                {"data": "change"},
                {"data": "subtotal"},
                {"data": "total"},
                {"data": "id"},
            ],
            columnDefs: [
                {
                    targets: [-1],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        let buttons = '<a rel="view_details" class="btn btn-sm btn-info remove-list"><i class="fa-regular fa-eye"></i></a> ';
                        return buttons;
                    }
                },
                {
                    targets: [-2, -3, -4, -5],
                    className: 'text-center',
                    orderable: true,
                    render: function (data, type, row) {
                        return '<strong>S/ ' + data + '</strong>'
                    }
                },
                {
                    targets: [-7],
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
        $('#tblViewSale tbody').off()
            .on('click', 'a[rel="view_details"]', function () {
                jQuery('.dataTable').wrap('<div class="dataTablesSaleDetail_scroll" />');
                let info = tblViewSale.row($(this).closest('tr')).data();
                let myModalSaleDetails = $('#myModalSaleDetailsView');
                myModalSaleDetails.modal('show');
                Sale.lis_SaleDetails(info.id);
            });
    },
    lis_SaleDetails: function (sale_id) {
        tblViewSalesDetails = new DataTable('#tblViewSaleDetails', {
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
                data: {'action': 'list_sale_detail', 'sale_id': sale_id},
                dataSrc: "",
            },
            columns: [
                {"data": "id"},
                {"data": "product.name"},
                {"data": "cant"},
                {"data": "price"},
                {"data": "subtotal"},
            ],
            // columnDefs: [
            //     {
            //         targets: [-1],
            //         className: 'text-center',
            //         orderable: false,
            //         render: function (data, type, row) {
            //             if (data !== "-") {
            //                 return '<strong style="color: red">S/ ' + data + '</strong>'
            //             }
            //             return data
            //
            //         }
            //     },
            //     {
            //         targets: [-2],
            //         className: 'text-center',
            //         orderable: false,
            //         render: function (data, type, row) {
            //             if (data !== "-") {
            //                 return '<strong style="color: green">S/ ' + data + '</strong>'
            //             }
            //             return data
            //
            //         }
            //     },
            //     {
            //         targets: [-3],
            //         className: 'text-center',
            //         orderable: true,
            //         render: function (data, type, row) {
            //             if (data === "Opening") {
            //                 return '<span class="badge bg-warning">Aperturado</span>'
            //             } else if (data == "Income") {
            //                 return '<span class="badge bg-success">Ingreso</span>'
            //             }
            //             return '<span class="badge bg-danger">Salida</span>'
            //
            //
            //         }
            //     },
            //     // {
            //     //     targets: [-10],
            //     //     class: 'text-center',
            //     //     orderable: true,
            //     //     render: function (data, type, row) {
            //     //         return data.first_name + " " + data.last_name;
            //     //     }
            //     // },
            //
            //
            // ],
            rowCallback(row, data, displayNum, displayIndex, dataIndex) {

            },
            initComplete: function (settings, json) {
                // $('body').find('.dataTables_scrollBody').addClass("scrollbar");
            }
        });
    }
}
$(function () {
    Sale.list();

});