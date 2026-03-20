from django.db import models


class SiteSettings(models.Model):
    """Singleton model — always pk=1. Holds general platform configuration."""

    email = models.CharField(max_length=200, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    link = models.CharField(max_length=500, blank=True, default="")
    api_key = models.CharField(max_length=500, blank=True, default="")

    class Meta:
        db_table = "panel_sitesettings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Configuración del sitio"
