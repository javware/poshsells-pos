let tblProduct;
let Car = {
    list: function () {
        tblProduct = new DataTable('#myTable', {
            "bFilter": false,
            // "ordering": false,
            "info": false,
            paging: false,
            // destroy: true,
            scrollX: true,
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
                // {
                //     targets: [-1],
                //     class: 'text-center',
                //     orderable: false,
                //     render: function (data, type, row) {
                //         let buttons = '<a rel="edit" class="btn btn-warning btn-sm"><i class="fas fa-pencil-alt"></i></a> ';
                //         buttons += '<a rel="aditional" class="btn btn-success btn-sm"><i class="fas fa-boxes"></i></a> ';
                //         buttons += '<a rel="remove" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></a>';
                //         return buttons
                //     }
                // },
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
                        alert("llego al stck")
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
    calculate_checkout: function () {
        $(".input_pyment").on("keyup", function () {
            let total = $(".input_total").val();
            let pyment = $(this).val();
            let vuelto = pyment === "" ? 0.00 : pyment - total
            $(".input_vuelto").val(parseFloat(vuelto).toFixed(2))
        })
    },
    automatic_calculate_checkout: function () {
        let total = $(".input_total").val();
        let pyment = $(".input_pyment").val();
        let vuelto = pyment === "" ? 0.00 : pyment - total
        $(".input_vuelto").val(parseFloat(vuelto).toFixed(2))

    }
}
$(function () {
    Car.list()
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
                            alert("llego al stck")
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

    Car.calculate_checkout();


})
