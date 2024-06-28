from django import forms

class UploadJsonForm(forms.Form):
    data = forms.FileField()