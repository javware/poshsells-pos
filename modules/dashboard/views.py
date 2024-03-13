import json
from datetime import date, datetime

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
# from crum import get_current_user
from django.views.generic import TemplateView

from modules.box_point.forms import ExpenseForm
from modules.box_point.models import CashRegister, CashMovement, CashType, Expense, TypeOperation
from modules.dashboard.cart import Car
from modules.inventory.models import Category, Product
from modules.purchase.forms import PurchaseForm
from modules.purchase.models import Purchase, PurchaseDetail
from modules.transactions.models import Sale, SaleDetail


# Create your views here.


class DashboardView(TemplateView):
    template_name = 'dashboard.html'
    success_url = reverse_lazy('dash:dashboard')

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            print(action)
            if action == 'add_product':
                data = []
                product_id = request.POST.get('product_id')
                product = Product.objects.get(id=product_id)
                data_car = Car(request).add_cart(product)
                data.append({'header_data': request.session.get("product_header_car"), 'data': data_car})
            elif action == 'restar_product':
                data = []
                product_id = request.POST.get('product_id')
                product = Product.objects.get(id=product_id)
                data_car = Car(request).restart_cart(product=product)
                data.append({'header_data': request.session.get("product_header_car"), 'data': data_car})
            elif action == "revome_item_product":
                data = []
                product_id = request.POST.get('product_id')
                product = Product.objects.get(id=product_id)
                data_car = Car(request).delete_cart(product=product)
                data.append({'header_data': request.session.get("product_header_car"), 'data': data_car})
            elif action == "search_product":
                data = []
                search_name = request.POST["search_name"]
                for i in Product.objects.filter(name__unaccent__icontains=search_name).filter(status='Active'):
                    item = i.toJSON()
                    data.append(item)
            elif action == "search_category_product":
                data = []
                for i in Product.objects.filter(category_id=request.POST["category_id"]).filter(status='Active'):
                    item = i.toJSON()
                    data.append(item)
            elif action == "search_category_product_all":
                data = []
                for i in Product.objects.filter(status='Active'):
                    item = i.toJSON()
                    data.append(item)
            elif action == "add_box_opening":
                json_box = json.loads(request.POST['json_box'])
                cash_register = CashRegister()
                cash_register.user_id = 1
                cash_register.opening_amount = float(json_box['amount'])
                cash_register.save()

                cash_movement = CashMovement()
                cash_movement.cash_register_id = cash_register.id
                cash_movement.cash_type = CashType.OPENING
                cash_movement.type_operation = TypeOperation.OPENING
                cash_movement.income_amount = float(json_box['amount'])
                cash_movement.description = json_box['description']
                cash_movement.save()

            elif action == "add_type_pyment":
                request.session["product_header_car"]["type_pyment"] = request.POST['type_pyment']
                request.session.modified = True
            elif action == "list_sale":
                data = []
                for i in Sale.objects.all():
                    item = i.toJSON()
                    data.append(item)
            elif action == "list_sale_detail":
                data = []
                for i in SaleDetail.objects.filter(sale_id=request.POST["sale_id"]):
                    item = i.toJSON()
                    data.append(item)
            elif action == "add_sale":
                header_car = request.session["product_header_car"]

                sale = Sale()
                sale.employee_id = 1
                sale.payment_method = header_car['type_pyment']
                sale.subtotal = header_car['total']
                sale.total = header_car['total']
                sale.cash = header_car['total'] if request.POST['pyment'] == "" else request.POST['pyment']
                sale.change = request.POST['vuelto']
                sale.save()

                for key, value in request.session["product_car"].items():
                    sale_detail = SaleDetail()
                    sale_detail.sale_id = sale.id
                    sale_detail.product_id = value['id']
                    sale_detail.cant = value['cant']
                    sale_detail.price = value['price']
                    sale_detail.subtotal = value['subtotal']
                    sale_detail.save()

                    # Actualizar stock del producto
                    product = Product.objects.get(id=value['id'])
                    product.stock -= value['cant']
                    product.save()

                cash_movement = CashMovement()
                cash_movement.cash_register_id = CashRegister.objects.get(status='Opened').id
                cash_movement.cash_type = CashType.INCOME
                cash_movement.type_operation = TypeOperation.SALE
                cash_movement.income_amount = float(header_car['total'])
                cash_movement.save()

                request.session["product_car"] = {}
                request.session["product_header_car"] = {}
                request.session.modified = True
            elif action == "list_cash":
                data = []
                for i in CashRegister.objects.all():
                    item = i.toJSON()
                    data.append(item)
            elif action == "list_movements":
                data = []
                for i in CashMovement.objects.filter(cash_register_id=request.POST['movement_id']):
                    item = i.toJSON()
                    data.append(item)
            elif action == "list_expense":
                data = []
                for i in Expense.objects.all():
                    item = i.toJSON()
                    data.append(item)
            elif action == "add_expense":
                expense = Expense()
                expense.expense_type_id = int(request.POST['expense_type'])
                expense.amount = request.POST['amount']
                expense.description = request.POST['description']
                expense.save()

                cash_movement = CashMovement()
                cash_movement.cash_register_id = CashRegister.objects.get(status='Opened').id
                cash_movement.cash_type = CashType.EXIT
                cash_movement.type_operation = TypeOperation.EXPENSE
                cash_movement.exit_amount = float(request.POST['amount'])
                cash_movement.description = request.POST['description']
                cash_movement.save()
            elif action == "autocomplete":
                data = []
                for i in Product.objects.filter(name__unaccent__icontains=request.POST['term']).filter(status='Active')[
                         :10]:
                    item = i.toJSON()
                    item['value'] = i.name
                    data.append(item)
            elif action == "search_barcode":
                data = []
                barcode = request.POST['barcode']
                for i in Product.objects.filter(barcode=barcode, status='Active'):
                    data.append(i.toJSON())
            elif action == "search_barcode_add_product":
                print(request.POST)
                data = []
                barcode = request.POST['barcode']
                try:
                    product = Product.objects.get(barcode=barcode)
                    if product.stock > 0:
                        data_car = Car(request).add_cart(product)
                        data.append({'header_data': request.session.get("product_header_car"), 'data': data_car})
                    else:
                        data.append({'data': 'stock', 'name': product.name, 'stocks': product.stock})
                except ObjectDoesNotExist:
                    data = []
            elif action == "add_purchase":
                purchase_details_json = json.loads(request.POST['purchase_details'])
                print(purchase_details_json)
                purchase = Purchase()
                purchase.provider_id = purchase_details_json['provider']
                purchase.receipt_type = purchase_details_json['receipt_type']
                purchase.serie = purchase_details_json['serie']
                purchase.number = purchase_details_json['number_serie']
                purchase.date_voucher = datetime.strptime(purchase_details_json['date_voucher'], "%Y-%m-%d").date()
                purchase.subtotal = purchase_details_json['subtotal']
                purchase.igv_cal = purchase_details_json['igv']
                purchase.total = purchase_details_json['total']
                purchase.description_purchase = purchase_details_json['description_purchase']
                purchase.save()

                for i in purchase_details_json['products']:
                    purchase_detail = PurchaseDetail()
                    purchase_detail.purchase_id = purchase.id
                    purchase_detail.product_id = i['id']
                    purchase_detail.purchase_price = i['purchase_price']
                    purchase_detail.sale_price = i['sale_price']
                    purchase_detail.cant = i['cant']
                    purchase_detail.subtotal = i['subtotal']
                    purchase_detail.save()

                    # Actualizar stock del producto
                    product = Product.objects.get(id=i['id'])
                    product.purchase_price = i['purchase_price']
                    product.sale_price = i['sale_price']
                    product.stock += i['cant']
                    product.save()

                cash_movement = CashMovement()
                cash_movement.cash_register_id = CashRegister.objects.get(status='Opened').id
                cash_movement.cash_type = CashType.EXIT
                cash_movement.type_operation = TypeOperation.PURCHASE
                cash_movement.description = purchase_details_json['description_purchase']
                cash_movement.exit_amount = float(purchase_details_json['total'])
                cash_movement.save()

            else:
                data['error'] = 'No ha ingresado una opción'
        except Exception as e:
            data['Error'] = str(e)

        return JsonResponse(data, safe=False)

    def get_category(self):
        category = Category.objects.filter(status="Active")
        return category

    def get_product(self):
        product = Product.objects.filter(status="Active")
        return product

    def box_opening(self):
        current_date = date.today()
        # box = CashRegister.objects.filter(opening_date__date=current_date, status='Opened').exists()
        box = CashRegister.objects.filter(~Q(status='Closed')).exists()
        return json.dumps(box)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Dashboard"
        context['sid_dashboard_active'] = 'active'
        context['get_category_list'] = self.get_category()
        context['get_product_list'] = self.get_product()
        context['box_opening'] = self.box_opening()
        context['expense_form'] = ExpenseForm()
        context['purchase_form'] = PurchaseForm()
        return context
