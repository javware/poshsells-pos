import json
from datetime import datetime, date
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
# from crum import get_current_user
from django.views.generic import TemplateView
from modules.dashboard.cart import Car
from modules.inventory.models import Category, Product, CashRegister
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
                cash_register.description = json_box['description']
                cash_register.save()
            elif action == "add_type_pyment":
                request.session["product_header_car"]["type_pyment"] = request.POST['type_pyment']
                request.session.modified = True
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



                request.session["product_car"] = {}
                request.session["product_header_car"] = {}
                request.session.modified = True
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
        box = CashRegister.objects.filter(opening_date__date=current_date, status='Opening').exists()
        print(box)
        return json.dumps(box)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Dashboard"
        context['sid_dashboard_active'] = 'active'
        context['get_category_list'] = self.get_category()
        context['get_product_list'] = self.get_product()
        context['box_opening'] = self.box_opening()
        return context
