from django.forms import *
from django import forms
from .models import *


class PurchaseForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # self.fields['expense_type'].widget.choices = [(i.id, i.name) for i in ExpenseType.objects.filter(state=True)]

    class Meta:
        model = Purchase
        fields = '__all__'
        widgets = {
            'provider': forms.Select(attrs={'class': 'form-select'}),
            'receipt_type': forms.Select(attrs={'class': 'form-select'}),
            'amount': forms.TextInput(attrs={'placeholder': 'Ingrese un monto', 'class': 'form-control'}),
            'description_purchase': forms.Textarea(
                attrs={'placeholder': 'Describe la compra', 'class': 'form-control', 'rows':'3',
                       'cols':'7'}),
        }
