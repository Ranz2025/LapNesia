<?php

declare(strict_types=1);

namespace Tests\Unit\Middleware;

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\CreatesTestData;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private RoleMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new RoleMiddleware;
    }

    public function test_allows_user_with_matching_role(): void
    {
        $seller = $this->createSeller();
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $seller);

        $response = $this->middleware->handle($request, fn ($req) => response()->json(['ok' => true]), 'seller');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_blocks_user_with_wrong_role(): void
    {
        $buyer = $this->createBuyer();
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $buyer);

        $response = $this->middleware->handle($request, fn ($req) => response()->json(['ok' => true]), 'seller');

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function test_blocks_unauthenticated_user(): void
    {
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => null);

        $response = $this->middleware->handle($request, fn ($req) => response()->json(['ok' => true]), 'seller');

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_allows_multiple_roles(): void
    {
        $admin = $this->createAdmin();
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $admin);

        $response = $this->middleware->handle($request, fn ($req) => response()->json(['ok' => true]), 'admin', 'owner');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_owner_passes_admin_owner_middleware(): void
    {
        $owner = $this->createOwner();
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $owner);

        $response = $this->middleware->handle($request, fn ($req) => response()->json(['ok' => true]), 'admin', 'owner');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
