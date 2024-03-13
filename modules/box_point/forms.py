from django.forms import *
from django import forms
from .models import *

from modules.box_point.models import ExpenseType, Expense


class ExpenseTypeForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['autofocus'] = True

    class Meta:
        model = ExpenseType
        fields = '__all__'
        labels = {
            "last_name": "Apellido Paterno:",
        }
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Ingrese tipo de gasto'}),
            'description': forms.Textarea(attrs={'placeholder': 'Describe el tipo de gasto'}),
            'state': forms.CheckboxInput(attrs={'class': 'checkbox'})
        }
        exclude = ['sede']


class ExpenseForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['expense_type'].widget.choices = [(i.id, i.name) for i in ExpenseType.objects.filter(state=True)]

    class Meta:
        model = Expense
        fields = '__all__'
        widgets = {
            'expense_type': forms.Select(attrs={'placeholder': 'Ingrese tipo de gasto', 'class': 'form-select'}),
            'amount': forms.TextInput(attrs={'placeholder': 'Describe el tipo de gasto', 'class': 'form-control'}),
            'description': forms.Textarea(
                attrs={'placeholder': 'Describe el tipo de gasto', 'class': 'form-control', 'rows':'3',
                       'cols':'7'}),
        }
        exclude = ['sede']
