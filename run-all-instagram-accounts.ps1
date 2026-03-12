$accounts = @(
    @{ Account = 'metmalbekasi'; Followers = 93505 },
    @{ Account = 'grandmetropolitan'; Followers = 92455 },
    @{ Account = 'metmalcileungsi'; Followers = 83251 },
    @{ Account = 'summareconmal.bekasi'; Followers = 332974 },
    @{ Account = 'pakuwonmallbekasi'; Followers = 72247 }
)

foreach ($item in $accounts) {
    Write-Host "========================================"
    Write-Host "Running $($item.Account)"
    powershell -ExecutionPolicy Bypass -File .\run-instagram-account.ps1 -Account $item.Account -Followers $item.Followers
}
