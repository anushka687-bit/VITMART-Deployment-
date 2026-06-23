<?php

namespace Tests\Feature;

use Tests\TestCase;

class RouteTest extends TestCase
{
    public function test_root_route(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_health_route(): void
    {
        $response = $this->get('/up');
        $response->assertStatus(200);
    }
}
