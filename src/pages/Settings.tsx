import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, Shield, Check, RefreshCw } from 'lucide-react';
import ImageCropper from '../components/ImageCropper';
import { UserSettings as UserSettingsType } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const getUserSettingsFromStorage = (): UserSettingsType => {
  const storedSettings = localStorage.getItem('userSettings');
  if (storedSettings) {
    return JSON.parse(storedSettings);
  }
  return {
    username: 'teacher_jane',
    fullName: 'Jane Smith',
    email: 'jane.smith@school.edu',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    darkMode: false,
  };
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  
  const [showQRCode, setShowQRCode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms' | 'authenticator'>('authenticator');
  const [setupStep, setSetupStep] = useState(1);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    const settings = getUserSettingsFromStorage();
    setUsername(settings.username);
    setFullName(settings.fullName);
    setEmail(settings.email);
    setProfilePicture(settings.profilePicture);
    setDarkMode(settings.darkMode);
  }, []);

  useEffect(() => {
    if (croppedImage) {
      setProfilePicture(croppedImage);
      setShowCropper(false);
    }
  }, [croppedImage]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    const originalSettings = getUserSettingsFromStorage();
    
    if (originalSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    navigate(-1);
  };

  const handleSave = () => {
    const newSettings = {
      username,
      fullName,
      email,
      profilePicture,
      darkMode,
    };
    
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully",
    });
    
    navigate(-1);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    });
    setShowPasswordChange(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangeEmail = () => {
    if (!emailSent) {
      if (!newEmail.includes('@') || !newEmail.includes('.')) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: "Verification code sent",
        description: `We've sent a verification code to ${newEmail}`,
      });
    } else {
      if (verificationCode !== "123456") {
        toast({
          title: "Error",
          description: "Invalid verification code. For this demo, use 123456",
          variant: "destructive"
        });
        return;
      }

      setEmail(newEmail);
      setShowEmailChange(false);
      setNewEmail("");
      setEmailPassword("");
      setVerificationCode("");
      setEmailSent(false);
      toast({
        title: "Email updated",
        description: "Your email has been changed successfully",
      });
    }
  };

  const goToNextSetupStep = () => {
    if (setupStep === 1) {
      setSetupStep(2);
    } else if (setupStep === 2) {
      if (twoFactorCode !== "123456") {
        toast({
          title: "Error",
          description: "Invalid verification code. For this demo, use 123456",
          variant: "destructive"
        });
        return;
      }
      
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setSetupStep(1);
      setTwoFactorCode("");
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account",
      });
    }
  };

  const handleDisableTwoFactor = () => {
    setTwoFactorEnabled(false);
    toast({
      title: "2FA Disabled",
      description: "Two-factor authentication has been disabled for your account",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Settings</h1>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 w-full">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <div className="flex items-center space-x-6 mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="profilePicture" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded cursor-pointer">
                      Change Profile Picture
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-2">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="email"
                        value={email}
                        readOnly
                        disabled
                        className="flex-1 bg-muted"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEmailChange(true);
                          setActiveTab("security");
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              {!showPasswordChange && !showEmailChange && !showQRCode && (
                <>
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Password</h3>
                          <p className="text-sm text-muted-foreground">Change your password</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setShowPasswordChange(true)} 
                        variant="outline"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Email</h3>
                          <p className="text-sm text-muted-foreground">Change your email address</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setShowEmailChange(true)} 
                        variant="outline"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground">
                            {twoFactorEnabled ? "Enabled" : "Add an extra layer of security"}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          if (twoFactorEnabled) {
                            handleDisableTwoFactor();
                          } else {
                            setShowQRCode(true);
                          }
                        }} 
                        variant="outline"
                      >
                        {twoFactorEnabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {showPasswordChange && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                  
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleChangePassword}>Save Password</Button>
                  </div>
                </div>
              )}

              {showEmailChange && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Change Email</h3>
                  
                  {!emailSent ? (
                    <>
                      <div>
                        <label htmlFor="newEmail" className="block text-sm font-medium mb-2">
                          New Email Address
                        </label>
                        <Input
                          id="newEmail"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="emailPassword" className="block text-sm font-medium mb-2">
                          Password (to confirm it's you)
                        </label>
                        <Input
                          id="emailPassword"
                          type="password"
                          value={emailPassword}
                          onChange={(e) => setEmailPassword(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="mb-4">
                        We've sent a verification code to <strong>{newEmail}</strong>.
                        Please check your inbox and enter the code below.
                      </p>
                      <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
                        Verification Code
                      </label>
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        For this demo, use the code: <strong>123456</strong>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowEmailChange(false);
                        setNewEmail("");
                        setEmailPassword("");
                        setVerificationCode("");
                        setEmailSent(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleChangeEmail}>
                      {emailSent ? "Verify" : "Send Verification Code"}
                    </Button>
                  </div>
                </div>
              )}

              {showQRCode && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Set Up Two-Factor Authentication</h3>
                  
                  {setupStep === 1 && (
                    <>
                      <div className="border border-border rounded-lg p-4 mb-4">
                        <div className="text-center">
                          <h4 className="font-medium mb-2">Choose Verification Method</h4>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <button
                              className={`p-4 rounded-lg border ${verificationMethod === 'authenticator' ? 'border-primary bg-primary/10' : 'border-border'}`}
                              onClick={() => setVerificationMethod('authenticator')}
                            >
                              <div className="flex flex-col items-center">
                                <RefreshCw className="h-6 w-6 mb-2" />
                                <span className="text-sm">Authenticator App</span>
                              </div>
                            </button>
                            <button
                              className={`p-4 rounded-lg border ${verificationMethod === 'sms' ? 'border-primary bg-primary/10' : 'border-border'}`}
                              onClick={() => setVerificationMethod('sms')}
                            >
                              <div className="flex flex-col items-center">
                                <Mail className="h-6 w-6 mb-2" />
                                <span className="text-sm">SMS</span>
                              </div>
                            </button>
                            <button
                              className={`p-4 rounded-lg border ${verificationMethod === 'email' ? 'border-primary bg-primary/10' : 'border-border'}`}
                              onClick={() => setVerificationMethod('email')}
                            >
                              <div className="flex flex-col items-center">
                                <Mail className="h-6 w-6 mb-2" />
                                <span className="text-sm">Email</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="border border-border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          {verificationMethod === 'authenticator' ? 'Scan QR Code with Authenticator App' : 
                          verificationMethod === 'sms' ? 'We\'ll send a code to your phone' : 
                          'We\'ll send a code to your email'}
                        </h4>
                        
                        {verificationMethod === 'authenticator' && (
                          <div className="flex justify-center my-4">
                            <div className="p-2 bg-white rounded-lg">
                              <img
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOPSURBVO3BQY4kRxIEQdNA/f/Lun0cPAqodoaHpGz8QWb+g8z8hcz8hcz8hcz8hcz8hcz8hcz8hcz8xcvLSMhPUjcJU3WT8CR1kzAJnzRJ+Enq3rwcZOYvZOYvZOYvXj6s0jcJm4QndVLdSd0kTOo2CZuETcKTqk3CJ6n7ps3LQWb+Qmb+Qmb+4uWHJdypuwl5UrVJmNRtEiZ1k3Cn7knCT1L3JOEnvXk5yMxfyMxfyMxfvPxPkzAJk7pJ3UnVJEzqJmFStwnbJPw/efNykJm/kJm/kJm/ePnPJEzqTuom4SRhUjcJP6n6SdV/yZuXg8z8hcz8hcz8xcsPq/4kdZMwCU+qJmGTsEl4kjAJd+qeVD1J+Jd583KQmb+Qmb+Qmb94+bAk4U7dJ6mbhDt1k3CnbhKeJJxU3ak7SdhUbRK+6c3LQWZ+X2Z+X2b+4uVlEqZK3SZhUjcJk7AJk7qbhEnCpuqbhE3CSdUm4aRqEjYJJ1UnVT/pzctBZv5CZv5CZv5CZv5CZv5CZv5CZv5CZv7i5WWlaptyp+4k4U7dJGwSTuomYVI3CZMwqdokPEl4UrWp+qRN1SZhU/VNb14OMvMXMvMXMvMXLz8sYVI3CZuEO3VPEu7UTcJJ1SZhExKqTqo2CZOwqZqESXhS9U1vXg4y8xcy8xcy8xcvLwl3qp4kbBJOEp5UTcKm6knCpmqTMKm7STipOkk4qZqEJ1WbhDtVn/Tm5SAzfyEzfyEzf/HyZarUTcIm4UnVJNypm4RNOJGQJ1V3Em4S7lSdVG2qvunNy0Fm/kJm/kJm/uLllyV8k7oTCXnSkzYJk7Cp2iScJJxU3al6knAn4UnVJNyp+qQ3LweZ+QuZ+QuZ+YuXl5GQSd0kbBI2VSdVk3CnbhKeJNxJeJIwqZuETdW/7M3LQWZ+X2Z+X2b+4uVlJWFTNQk/Sd2ThEndk4STqjtVk3Cn6qRqU7VJuJNwp2pTdafqm968HGTmL2TmL2TmL15eRkJ+krpJOKnahCdVk7CpOkm4SbhTdSfhScKk7k7Vk4Rv0vdJb14OMvMXMvMXMvMXLx9WVd+k7iTh/5m6ScIm4U7dJGwSTqomYVJ3UrVJmNRtEt68HGTmL2TmL2TmL15+WMKdujsJP0ndJEzCScImTBJOqiZhUrdJeJJwU/VNwqTuJ715OcjMX8jMX8jMX7z8H0vYVN1JOKmahEnYhEl4UrVJmNRNwqRuU3WTMKm7SbhTdafqzctBZv5CZv5CZv5CZv5CZv5CZv5CZv5CZv7DfwDUUMniz7jBLQAAAABJRU5ErkJggg=="
                                alt="QR Code for 2FA"
                                className="w-40 h-40"
                              />
                            </div>
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground">
                          {verificationMethod === 'authenticator' ? 
                            "Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)" : 
                            verificationMethod === 'sms' ? 
                            "We'll send a verification code to your phone number" : 
                            "We'll send a verification code to your email address"}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {setupStep === 2 && (
                    <div>
                      <p className="mb-4">
                        {verificationMethod === 'authenticator' ? 
                          "Enter the code from your authenticator app" : 
                          `Enter the verification code sent to your ${verificationMethod === 'sms' ? 'phone' : 'email'}`}
                      </p>
                      <label htmlFor="twoFactorCode" className="block text-sm font-medium mb-2">
                        Verification Code
                      </label>
                      <Input
                        id="twoFactorCode"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        For this demo, use the code: <strong>123456</strong>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowQRCode(false);
                        setTwoFactorCode("");
                        setSetupStep(1);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={goToNextSetupStep}>
                      {setupStep === 1 ? "Continue" : "Verify"}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <ImageCropper
              src={tempImageSrc}
              onCrop={setCroppedImage}
              onCancel={() => setShowCropper(false)}
            />
          </div>
        )}
        
        <div className="flex justify-end mt-6 space-x-3">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
