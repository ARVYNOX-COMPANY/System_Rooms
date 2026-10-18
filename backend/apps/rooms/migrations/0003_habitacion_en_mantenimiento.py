from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("rooms", "0002_habitacion_oculta"),
    ]

    operations = [
        migrations.AddField(
            model_name="habitacion",
            name="en_mantenimiento",
            field=models.BooleanField(default=False),
        ),
    ]
