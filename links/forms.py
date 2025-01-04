from django import forms
from links.models import CustomUser, Folder, Link
from dal import autocomplete


class RegisterForm(forms.ModelForm):
    password = forms.CharField(label='Password', widget=forms.PasswordInput)
    confirmation = forms.CharField(label='Confirmation', widget=forms.PasswordInput)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirmation = cleaned_data.get("confirmation")

        if password and confirmation and password != confirmation:
            self.add_error('password', "Passwords don't match.")

    def clean_email(self):
        data = self.cleaned_data['email']
        if CustomUser.objects.filter(email=data).exists():
            raise forms.ValidationError('Email already in use')
        return data

    def clean_username(self):
        data = self.cleaned_data['username']
        if CustomUser.objects.filter(username__iexact=data).exists():
            raise forms.ValidationError('Username already in use')
        return data


class LoginForm(forms.ModelForm):
    password = forms.CharField(label='Password', widget=forms.PasswordInput)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']

    def clean_username(self):
        data = self.cleaned_data['username']
        if not CustomUser.objects.filter(username__iexact=data).exists():
            raise forms.ValidationError('Username or passsword incorrect')


class FolderCreationForm(forms.ModelForm):
    class Meta:
        model = Folder
        fields = ['title', 'public', 'collaborators', 'watchers']
        widgets = {
            'collaborators': autocomplete.ModelSelect2Multiple(url='user-autocomplete'),
            'watchers': autocomplete.ModelSelect2Multiple(url='user-autocomplete'),

        }




