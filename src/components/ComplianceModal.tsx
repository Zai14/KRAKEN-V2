import React, { useState } from 'react';
import { Shield, FileText, Eye, Download, Check, X, AlertTriangle } from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ComplianceModal({ isOpen, onAccept, onDecline }: ComplianceModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedDataRetention, setAcceptedDataRetention] = useState(false);
  const [currentTab, setCurrentTab] = useState<'terms' | 'privacy' | 'retention'>('terms');

  if (!isOpen) return null;

  const canProceed = acceptedTerms && acceptedPrivacy && acceptedDataRetention;

  const handleAccept = () => {
    if (canProceed) {
      // Store compliance acceptance
      const complianceData = {
        termsAccepted: true,
        privacyAccepted: true,
        dataRetentionAccepted: true,
        acceptedAt: new Date().toISOString(),
        version: '1.0',
        ipAddress: 'client-side', // In production, get from server
        userAgent: navigator.userAgent
      };
      
      localStorage.setItem('kraken_compliance', JSON.stringify(complianceData));
      onAccept();
    }
  };

  const downloadDocument = (type: string) => {
    const content = getDocumentContent(type);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kraken-${type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDocumentContent = (type: string): string => {
    switch (type) {
      case 'terms':
        return `KRAKEN MESSAGING PLATFORM - TERMS OF SERVICE

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By accessing and using Kraken, you accept and agree to be bound by these Terms of Service.

2. DESCRIPTION OF SERVICE
Kraken is a decentralized messaging platform that enables secure, encrypted communication using Web3 technologies.

3. USER RESPONSIBILITIES
- You are responsible for maintaining the security of your wallet and private keys
- You must not use the service for illegal activities
- You must comply with all applicable laws and regulations

4. PRIVACY AND DATA PROTECTION
- Messages are encrypted end-to-end
- We do not store your private keys
- Local data is encrypted and can be deleted at any time

5. LIMITATION OF LIABILITY
The service is provided "as is" without warranties of any kind.

6. TERMINATION
You may terminate your account at any time by disconnecting your wallet.

7. GOVERNING LAW
These terms are governed by applicable international laws.

For questions, contact: support@kraken-messaging.com`;

      case 'privacy':
        return `KRAKEN MESSAGING PLATFORM - PRIVACY POLICY

Last Updated: ${new Date().toLocaleDateString()}

1. INFORMATION WE COLLECT
- Wallet addresses for authentication
- Encrypted message data (stored locally)
- Basic usage analytics (anonymized)

2. HOW WE USE INFORMATION
- To provide messaging services
- To improve platform security
- To comply with legal requirements

3. DATA STORAGE
- Messages are stored locally on your device
- Encrypted backups may be stored on decentralized networks
- We do not have access to your private messages

4. DATA SHARING
- We do not sell or share personal data
- Data may be shared only as required by law
- Anonymous usage statistics may be shared for research

5. YOUR RIGHTS (GDPR)
- Right to access your data
- Right to delete your data
- Right to data portability
- Right to rectification

6. SECURITY
- End-to-end encryption for all messages
- Regular security audits
- Secure key management practices

7. CONTACT
For privacy concerns: privacy@kraken-messaging.com`;

      case 'retention':
        return `KRAKEN MESSAGING PLATFORM - DATA RETENTION POLICY

Last Updated: ${new Date().toLocaleDateString()}

1. DATA RETENTION PERIODS
- Message data: Stored locally until user deletion
- Authentication data: 30 days after last login
- Usage logs: 90 days maximum
- Error logs: 30 days maximum

2. AUTOMATIC DELETION
- Expired messages are automatically deleted
- Inactive accounts are purged after 1 year
- Temporary data is cleared after each session

3. USER-CONTROLLED DELETION
- Users can delete messages at any time
- Account deletion removes all associated data
- Export functionality available before deletion

4. LEGAL RETENTION
- Data may be retained longer if required by law
- Court orders may extend retention periods
- Compliance with regulatory requirements

5. SECURE DELETION
- Data is cryptographically wiped
- Multiple overwrite passes for sensitive data
- Verification of deletion completion

6. BACKUP RETENTION
- Encrypted backups retained for 30 days
- Backups are automatically purged
- No long-term backup storage

Contact: legal@kraken-messaging.com`;

      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">Legal Compliance</h2>
                <p className="text-zinc-400">Please review and accept our terms to continue</p>
              </div>
            </div>
            <button
              onClick={onDecline}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {[
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Eye },
            { id: 'retention', label: 'Data Retention', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 p-4 transition-colors ${
                currentTab === id
                  ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-100">
              {currentTab === 'terms' && 'Terms of Service'}
              {currentTab === 'privacy' && 'Privacy Policy'}
              {currentTab === 'retention' && 'Data Retention Policy'}
            </h3>
            <button
              onClick={() => downloadDocument(currentTab)}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Download</span>
            </button>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {getDocumentContent(currentTab)}
          </div>
        </div>

        {/* Acceptance Checkboxes */}
        <div className="p-6 border-t border-zinc-800 space-y-4">
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-500 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-300">
                I have read and agree to the <strong>Terms of Service</strong>
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-500 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-300">
                I have read and agree to the <strong>Privacy Policy</strong>
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedDataRetention}
                onChange={(e) => setAcceptedDataRetention(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-500 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-300">
                I understand and agree to the <strong>Data Retention Policy</strong>
              </span>
            </label>
          </div>

          {!canProceed && (
            <div className="flex items-center space-x-2 text-amber-400 bg-amber-500/10 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Please accept all terms to continue</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-zinc-800 flex space-x-4">
          <button
            onClick={onDecline}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 py-3 px-4 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={!canProceed}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>Accept & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}