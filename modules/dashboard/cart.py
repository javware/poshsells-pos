from decimal import Decimal


class Car:
    def __init__(self, request):
        self.request = request
        self.session = request.session
        data_car = self.session.get("product_car")
        data_header_car = self.session.get("product_header_car")
        if not data_car:
            data_car = self.session["product_car"] = {}
            self.session.modified = True
        if not data_header_car:
            data_header_car = self.session["product_header_car"] = {}
            data_header_car = self.session["product_header_car"]["type_pyment"] = 'Cash'
            self.session.modified = True
        self.data_car = data_car
        self.data_header_car = data_header_car

    def add_cart(self, product):
        if str(product.id) not in self.data_car.keys():
            total = 0
            subtotal = Decimal(product.sale_price) * 1
            self.data_car[product.id] = {'id': product.id, 'name': product.name, 'price': f'{product.sale_price:.2f}',
                                         'purchase_price': f'{product.purchase_price:.2f}', 'stock': f'{product.stock:.4f}',
                                         'cant': 1, 'subtotal': f'{float(subtotal):.2f}', 'kilo': 'true' if product.kilo else 'false', }
            for key, values in self.session["product_car"].items():
                total = total + (float(values['price']) * float(values['cant']))
                values["total"] = total
                self.session["product_header_car"]["total"] = f'{total:.2f}'
                self.session.modified = True
        else:
            for key, value in self.data_car.items():
                if key == str(product.id):
                    value["cant"] = value["cant"] + 1 if value["cant"] < product.stock else value["cant"]
                    value["stock"] = f'{product.stock:.4f}'
                    self.total_amount_car(product, value)
                    break
        self.save_cart()
        return self.data_car

    def add_cart_cant(self, product, cant):
        print(cant)
        for key, value in self.data_car.items():
            if key == str(product.id):
                value["cant"] = cant
                value["stock"] = f'{product.stock:.4f}'
                self.total_amount_car(product, value)
                break
        self.save_cart()
        return self.data_car

    def save_cart(self):
        self.session["product_car"] = self.data_car
        self.session.modified = True

    def delete_cart(self, product):
        total = 0
        product.id = str(product.id)
        if product.id in self.data_car.keys():
            del self.data_car[product.id]
            for key, values in self.session["product_car"].items():
                total = total + (float(values['price']) * values['cant'])
                values["total"] = total
                self.session["product_header_car"]["total"] = f'{total:.2f}'
                self.session.modified = True
            self.save_cart()
        if len(self.session["product_car"]) == 0:
            print("vacio")
            self.session["product_header_car"]["total"] = f'{0:.2f}'
            self.session.modified = True
        return self.data_car

    def restart_cart(self, product):
        for key, value in self.data_car.items():
            if key == str(product.id):
                value["cant"] = value["cant"] - 1
                value["stock"] = f'{product.stock:.2f}'
                self.total_amount_car(product, value)

                if value["cant"] < 1:
                    self.delete_cart(product)
                break
        self.save_cart()
        return self.data_car

    def clean_cart(self):
        self.session["product_car"] = {}
        self.session.modified = True

    def total_amount_car(self, product, value):
        total = 0
        subtotal = Decimal(product.sale_price) * Decimal(value["cant"])
        value["subtotal"] = f'{float(subtotal):.2f}'

        for key, values in self.session["product_car"].items():
            total = total + (float(values['price']) * float(values['cant']))
            values["total"] = total
            self.session["product_header_car"]["total"] = f'{total:.2f}'
            self.session.modified = True
