import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CredentialsTable() {
  const credentials = [
    {
      role: 'Admin (Vendor)',
      username: 'admin',
      password: 'password',
      description: 'Manage audit scheduling, assign auditors, configure checklists',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    {
      role: 'Guest Auditor',
      username: 'auditor',
      password: 'password',
      description: 'Conduct audits, record observations, upload media',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      role: 'Final Reviewer (QA)',
      username: 'reviewer',
      password: 'password',
      description: 'Validate reports, override scores, final submission',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      role: 'QA Corporate',
      username: 'corporate',
      password: 'password',
      description: 'Analytics overview, compliance dashboards, metrics',
      color: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      role: 'Hotel GM',
      username: 'hotelgm',
      password: 'password',
      description: 'Property results, action plans, improvement tracking',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo Login Credentials</CardTitle>
        <p className="text-sm text-gray-600">Use these credentials to access different persona dashboards</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Role</th>
                <th className="text-left p-2 font-medium">Username</th>
                <th className="text-left p-2 font-medium">Password</th>
                <th className="text-left p-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((cred, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cred.color}`}>
                      {cred.role}
                    </span>
                  </td>
                  <td className="p-2 font-mono text-sm bg-gray-100 rounded">{cred.username}</td>
                  <td className="p-2 font-mono text-sm bg-gray-100 rounded">{cred.password}</td>
                  <td className="p-2 text-sm text-gray-600">{cred.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}