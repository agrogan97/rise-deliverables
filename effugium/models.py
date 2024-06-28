from django.db import models

class RawLevelData(models.Model):

    userId = models.CharField(max_length = 128, unique=True)
    rawData = models.JSONField(blank=True, null=True)
    edata = models.JSONField(blank=True, null=True)
    parameters = models.JSONField(blank=True, null=True)
    completeAttempt = models.JSONField(blank=True, null=True)
    userIP = models.CharField(max_length=64, blank=True)
    urlParameters = models.JSONField(blank=True, null=True)
    timeCreated = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)

class RiseData(models.Model):
    userId = models.CharField(max_length = 128, unique=True)
    rawData = models.JSONField(blank=True, default=dict)
    registeredComplete = models.BooleanField(blank=True, default=False)
    urlParameters = models.JSONField(blank=True, default=dict)
    timeCreated = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)
    cohortYear = models.CharField(max_length=64, blank=True)
    isStaff = models.BooleanField(default=False)
    ENV_CHOICES = [
        ("staging", "staging"),
        ("production", "production"),
        ("other", "other")
    ]
    environment = models.CharField(max_length=16, choices=ENV_CHOICES, default="production")

# --- Roomworld V2 Tables ---
class Config(models.Model):
    class Meta:
        verbose_name = "Config"
        verbose_name_plural = "Configs"
    
    layoutId = models.CharField(max_length=64, unique=True)
    layout = models.CharField(max_length=2048)
    timeCreated = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)

class Config4D(models.Model):
    class Meta:
        verbose_name = "Config4D"
        verbose_name_plural = "Configs4D"
    
    layoutId = models.CharField(max_length=64, unique=True)
    layout = models.CharField(max_length=2048)
    timeCreated = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)

class PlayerData(models.Model):
    class Meta:
        verbose_name = "PlayerData"
        verbose_name_plural = "PlayerData"
    UserId = models.CharField(max_length=256, unique=True)
    iv = models.CharField(max_length=256, null=True)
    tag = models.CharField(max_length=256, null=True)
    data = models.JSONField(default=dict)
    gameParameters = models.JSONField(default=dict)
    riseTracking = models.JSONField(default=dict)
    registeredComplete = models.BooleanField(default=False)
    playMode = models.CharField(max_length=16, default="3D")
    timeCreated = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)
    cohortYear = models.CharField(max_length=64, blank=True)
    isStaff = models.BooleanField(default=False)
    ENV_CHOICES = [
        ("staging", "staging"),
        ("production", "production"),
        ("other", "other")
    ]
    environment = models.CharField(max_length=16, choices=ENV_CHOICES, default="production")
